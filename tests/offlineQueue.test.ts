// Mock AsyncStorage before importing the module under test so imports use the mock
const __storageMock: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: async (k: string) => (__storageMock.hasOwnProperty(k) ? __storageMock[k] : null),
  setItem: async (k: string, v: string) => { __storageMock[k] = v; return null; },
  removeItem: async (k: string) => { delete __storageMock[k]; return null; },
  clear: async () => { for (const k of Object.keys(__storageMock)) delete __storageMock[k]; return null; },
  __INTERNAL__storage: __storageMock
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { enqueueRequest, getQueue, clearQueue, removeFromQueue } from '../lib/offlineQueue';

describe('offlineQueue basic operations', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('enqueue and getQueue returns item', async () => {
    const id = await enqueueRequest('POST', '/test', { a: 1 });
    const q = await getQueue();
    expect(q.length).toBe(1);
    expect(q[0].id).toBe(id);
    expect(q[0].method).toBe('POST');
  });

  test('removeFromQueue removes item', async () => {
    const id = await enqueueRequest('POST', '/test2', { b: 2 });
    let q = await getQueue();
    expect(q.find((x) => x.id === id)).toBeDefined();
    await removeFromQueue(id);
    q = await getQueue();
    expect(q.find((x) => x.id === id)).toBeUndefined();
  });

  test('clearQueue removes all items', async () => {
    await enqueueRequest('POST', '/one', { x: 1 });
    await enqueueRequest('POST', '/two', { x: 2 });
    let q = await getQueue();
    expect(q.length).toBeGreaterThanOrEqual(2);
    await clearQueue();
    q = await getQueue();
    expect(q.length).toBe(0);
  });
});
