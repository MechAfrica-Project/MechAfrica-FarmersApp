import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from './apiEndpoints';

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
    // require AsyncStorage lazily so tests can mock the module before use
    // (jest setup mocks are applied in setupFilesAfterEnv)
     
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedRequest[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedRequest[]) {
  try {
    // require AsyncStorage lazily so tests can mock the module before use
     
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
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
  if (process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined') {
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

    const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://your-api.com';
    let token: string | null = null;
    try {
      token = await SecureStore.getItemAsync('token');
    } catch {}

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
              } catch {}
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
              } catch {}
            }
          }
        } catch {}
      } catch {
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

  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://your-api.com';
  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync('token');
  } catch {}

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
     
    console.debug('[offlineQueue] retryQueueItem - requeuing item', item.id, 'queueBeforeWriteLength=', (await readQueue()).length);
    await writeQueue(newQueue);
     
    console.debug('[offlineQueue] retryQueueItem - requeued item, queueAfterWriteLength=', (await readQueue()).length);
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

export default { enqueueRequest, processQueue, getQueue, clearQueue, removeFromQueue, retryQueueItem, _test_setQueue };
