import { getAuthToken } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { API_ENDPOINTS } from './apiEndpoints';
import { API_URL_PLACEHOLDER, getNodeEnv, resolveApiUrlRaw } from './env';

// Import stores to map server responses back to local placeholders
import { useFarmerStore } from '@/stores/farmerStore';
import { useRequestsStore } from '@/stores/requestsStore';

const QUEUE_KEY = 'offlineRequestQueue:v1';

type QueuedRequest = {
  id: string;
  method: string;
  endpoint: string;
  body?: any;
  attempts?: number;
  createdAt: number;
};

let processing = false;

function computeListsByStatusLocal(byId: Record<string, any>) {
  const values = Object.values(byId || {});
  return {
    pending: values.filter((r: any) => r?.status === 'pending'),
    ongoing: values.filter((r: any) => r?.status === 'ongoing'),
    completed: values.filter((r: any) => r?.status === 'completed'),
    cancelled: values.filter((r: any) => r?.status === 'cancelled'),
  };
}

async function readQueue(): Promise<QueuedRequest[]> {
  try {
    // import AsyncStorage dynamically so tests can mock the module before use
    // (jest setup mocks are applied in setupFilesAfterEnv)
    const mod = await import('@react-native-async-storage/async-storage');
    const AsyncStorage = (mod as any).default ?? mod;
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedRequest[];
  } catch (err) {
    if (__DEV__) console.warn('Failed to read offline queue', err);
    return [];
  }
}

async function writeQueue(queue: QueuedRequest[]) {
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    const AsyncStorage = (mod as any).default ?? mod;
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    if (__DEV__) console.warn('Failed to write offline queue', err);
  }
}

export async function enqueueRequest(method: string, endpoint: string, body?: any) {
  const q = await readQueue();
  const item: QueuedRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    method,
    endpoint,
    body,
    attempts: 0,
    createdAt: Date.now(),
  };
  q.push(item);
  await writeQueue(q);
  return item.id;
}

async function delay(ms: number) {
  // During unit tests we want retries to be fast and deterministic.
  if (getNodeEnv() === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined') {
    return Promise.resolve();
  }
  return new Promise((r) => setTimeout(r, ms));
}

async function trySend(item: QueuedRequest, baseUrl: string, token?: string) {
  const url = `${baseUrl}${item.endpoint}`;
  // detect upload endpoint and handle FormData
  const isUpload = item.endpoint === API_ENDPOINTS.UPLOADS;

  if (isUpload && item.body && item.body.uri) {
    const form = new FormData();
    // @ts-ignore - RN FormData uses { uri, name, type }
    form.append('file', { uri: item.body.uri, name: item.body.name ?? 'upload.jpg', type: item.body.type ?? 'image/jpeg' } as any);
    // append other fields if present
    if (item.body.fields && typeof item.body.fields === 'object') {
      for (const k of Object.keys(item.body.fields)) form.append(k, item.body.fields[k]);
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { method: item.method, body: form as any, headers });
    return res;
  }

  // Intercept payload to upload any local audio files before sending the JSON body
  if (!isUpload && item.body && typeof item.body === 'object') {
    const localUri = item.body.voiceNoteUrl || item.body.voice_note_url;
    if (typeof localUri === 'string' && localUri.startsWith('file://')) {
      const form = new FormData();
      // @ts-ignore
      form.append('file', { uri: localUri, name: 'voicenote.m4a', type: 'audio/m4a' } as any);
      
      const uploadHeaders: Record<string, string> = {};
      if (token) uploadHeaders['Authorization'] = `Bearer ${token}`;
      
      const uploadRes = await fetch(`${baseUrl}${API_ENDPOINTS.UPLOADS}`, {
        method: 'POST',
        headers: uploadHeaders,
        body: form as any,
      });

      if (uploadRes.ok) {
        try {
          const uploadData = await uploadRes.json();
          if (uploadData && uploadData.url) {
            // Replace local URI with the remote URL
            if (item.body.voiceNoteUrl) item.body.voiceNoteUrl = uploadData.url;
            if (item.body.voice_note_url) item.body.voice_note_url = uploadData.url;
          }
        } catch (e) {
          if (__DEV__) console.warn('Failed to parse audio upload response during offline sync', e);
        }
      } else {
        // If the upload fails (e.g. 500 error), we return the failed response so processQueue retries the whole item
        return uploadRes;
      }
    }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: item.method,
    headers,
    body: item.body ? JSON.stringify(item.body) : undefined,
  });
  return res;
}

export async function processQueue() {
  if (processing) return;
  processing = true;
  try {
    const queue = await readQueue();
    if (!queue || queue.length === 0) return;

    const baseUrl = (() => {
      // First try Constants (set at build time from app.config.js)
      let url = Constants.expoConfig?.extra?.apiUrl;

      // Fallback to resolveApiUrlRaw for development
      if (!url) {
        url = resolveApiUrlRaw();
      }

      if (!url || url === API_URL_PLACEHOLDER) {
        if (getNodeEnv() !== 'production') {
          console.warn('⚠️ EXPO_PUBLIC_API_BASE_URL (or EXPO_PUBLIC_API_URL) not set! Offline queue will use placeholder URL.');
          console.warn('   Set this in your .env file. See .env.example for reference.');
          return API_URL_PLACEHOLDER;
        }
        return null;
      }
      return url.replace(/\/$/, '');
    })();

    if (!baseUrl) {
      processing = false;
      return;
    }
    let token: string | null = null;
    try {
      // prefer in-memory/AsyncStorage-backed token from api client
      token = getAuthToken() ?? null;
    } catch (err) {
      if (__DEV__) console.warn('Failed to get token for offline queue', err);
    }

    const remaining: QueuedRequest[] = [];

    for (const item of queue) {
      try {
        const res = await trySend(item, baseUrl, token ?? undefined);
        if (!res.ok) {
          item.attempts = (item.attempts ?? 0) + 1;
          // drop client errors
          if (res.status >= 400 && res.status < 500) {
            // dropped
            continue;
          }
          // give up after 5 attempts
          if ((item.attempts ?? 0) >= 5) continue;

          // backoff before next attempt
          const backoff = Math.min(60000, 1000 * Math.pow(2, item.attempts ?? 1)) + Math.floor(Math.random() * 1000);
          await delay(backoff);
          remaining.push(item);
        }
        // success -> attempt to map server response back to local placeholders
        try {
          // try parse JSON response body; if it fails, ignore mapping
          const body = await (async () => {
            try {
              return await res.json();
            } catch {
              return null;
            }
          })();

          if (body) {
            // Map for requests
            if (item.endpoint === API_ENDPOINTS.REQUESTS || item.endpoint.startsWith(API_ENDPOINTS.REQUESTS + '/')) {
              try {
                const reqStore = useRequestsStore;
                const state = reqStore.getState();
                // find placeholder by _queuedId
                const byId = { ...state.byId };
                const placeholderEntry = Object.entries(byId).find(([, v]: any) => v && (v as any)._queuedId === item.id);
                if (placeholderEntry) {
                  const [localId] = placeholderEntry;
                  // remove placeholder and add server-saved item
                  delete byId[localId];
                  const serverReq = (body && body.request) ? body.request : body;
                  if (serverReq && serverReq.id) byId[serverReq.id] = serverReq;
                  reqStore.setState({ byId, listsByStatus: computeListsByStatusLocal(byId) } as any);
                }
              } catch { }
            }

            // Map for farmer farms
            if (item.endpoint === API_ENDPOINTS.FARMER_FARMS || item.endpoint.startsWith(API_ENDPOINTS.FARMER_FARMS + '/')) {
              try {
                const farmStore = useFarmerStore;
                const state = farmStore.getState();
                const farms = Array.isArray(state.farms) ? [...state.farms] : [];
                const idx = farms.findIndex((f: any) => f && f._queuedId === item.id);
                const serverFarm = (body && body.farm) ? body.farm : body;
                if (idx !== -1 && serverFarm && serverFarm.id) {
                  farms.splice(idx, 1, serverFarm);
                  farmStore.setState({ farms } as any);
                }
                // if not found, and server returned a farm, push it
                if (idx === -1 && serverFarm && serverFarm.id) {
                  farms.push(serverFarm);
                  farmStore.setState({ farms } as any);
                }
              } catch { }
            }
          }
        } catch (err) {
          if (__DEV__) console.warn('Failed to process offline sync response mapping', err);
        }
      } catch (err) {
        if (__DEV__) console.warn(`Request failed in offline queue, will retry. Endpoint: ${item.endpoint}`, err);
        item.attempts = (item.attempts ?? 0) + 1;
        if ((item.attempts ?? 0) >= 5) continue;
        const backoff = Math.min(60000, 1000 * Math.pow(2, item.attempts ?? 1)) + Math.floor(Math.random() * 1000);
        await delay(backoff);
        remaining.push(item);
      }
    }

    await writeQueue(remaining);
  } finally {
    processing = false;
  }
}

export async function getQueue() {
  return await readQueue();
}

export async function clearQueue() {
  await writeQueue([]);
}

export async function removeFromQueue(id: string) {
  const q = await readQueue();
  const filtered = q.filter((i) => i.id !== id);
  await writeQueue(filtered);
}

// Retry a single queued request by id. Returns an object describing the outcome.
export async function retryQueueItem(id: string) {
  const queue = await readQueue();
  const idx = queue.findIndex((i) => i.id === id);
  if (idx === -1) return { ok: false, error: 'not_found' };

  const item = queue[idx];
  // Remove item from stored queue while we attempt
  const remaining = queue.filter((i) => i.id !== id);
  await writeQueue(remaining);

  const baseUrl = (() => {
    // First try Constants (set at build time from app.config.js)
    let url = Constants.expoConfig?.extra?.apiUrl;

    // Fallback to resolveApiUrlRaw for development
    if (!url) {
      url = resolveApiUrlRaw();
    }

    if (!url || url === API_URL_PLACEHOLDER) {
      if (getNodeEnv() !== 'production') {
        console.warn('⚠️ EXPO_PUBLIC_API_BASE_URL (or EXPO_PUBLIC_API_URL) not set! Retry will use placeholder URL.');
        console.warn('   Set this in your .env file. See .env.example for reference.');
        return API_URL_PLACEHOLDER;
      }
      return null;
    }
    return url.replace(/\/$/, '');
  })();

  if (!baseUrl) {
    return { ok: false, error: 'api_url_not_configured' };
  }

  let token: string | null = null;
  try {
    token = getAuthToken() ?? null;
    if (!token) token = await SecureStore.getItemAsync('token');
  } catch (err) {
    if (__DEV__) console.warn('Failed to get token for retry', err);
  }

  try {
    const res = await trySend(item, baseUrl, token ?? undefined);
    if (!res.ok) {
      item.attempts = (item.attempts ?? 0) + 1;
      // drop client errors
      if (res.status >= 400 && res.status < 500) {
        // do not requeue
        return { ok: false, status: res.status };
      }
      if ((item.attempts ?? 0) >= 5) return { ok: false, status: res.status };
      // requeue with backoff
      const backoff = Math.min(60000, 1000 * Math.pow(2, item.attempts ?? 1)) + Math.floor(Math.random() * 1000);
      await delay(backoff);
      const newQueue = [item, ...remaining];
      await writeQueue(newQueue);
      return { ok: false, status: res.status };
    }
    // success
    return { ok: true, status: res.status };
  } catch {
    item.attempts = (item.attempts ?? 0) + 1;
    if ((item.attempts ?? 0) >= 5) return { ok: false, error: 'failed' };
    const backoff = Math.min(60000, 1000 * Math.pow(2, item.attempts ?? 1)) + Math.floor(Math.random() * 1000);
    // Ensure the item is written back to storage immediately so callers can observe
    // the queued state before any optional delay/backoff (helps tests and resilience).
    const newQueue = [item, ...remaining];
    // debug logs for test troubleshooting

    if (getNodeEnv() !== 'production') {
      console.debug('[offlineQueue] retryQueueItem - requeuing item', item.id, 'queueBeforeWriteLength=', (await readQueue()).length);
    }
    await writeQueue(newQueue);

    if (getNodeEnv() !== 'production') {
      console.debug('[offlineQueue] retryQueueItem - requeued item, queueAfterWriteLength=', (await readQueue()).length);
    }
    await delay(backoff);
    return { ok: false, error: 'retry_scheduled' };
  }
}

// ---- Test helpers ----
// Expose a small helper used only by unit tests to seed the queue deterministically.
// This is intentionally named with a leading underscore to indicate non-production usage.
export async function _test_setQueue(items: QueuedRequest[]) {
  await writeQueue(items);
}

// ---- Cache helpers ----
// Store and retrieve GET responses for offline fallback
const CACHE_PREFIX = 'offline_cache_';

export async function setCache(endpoint: string, data: any) {
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    const AsyncStorage = (mod as any).default ?? mod;
    await AsyncStorage.setItem(CACHE_PREFIX + endpoint, JSON.stringify(data));
  } catch (err) {
    if (__DEV__) console.warn(`Failed to set cache for ${endpoint}`, err);
  }
}

export async function getCache(endpoint: string) {
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    const AsyncStorage = (mod as any).default ?? mod;
    const val = await AsyncStorage.getItem(CACHE_PREFIX + endpoint);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    if (__DEV__) console.warn(`Failed to get cache for ${endpoint}`, err);
    return null;
  }
}

export default { enqueueRequest, processQueue, getQueue, clearQueue, removeFromQueue, retryQueueItem, _test_setQueue, setCache, getCache };
