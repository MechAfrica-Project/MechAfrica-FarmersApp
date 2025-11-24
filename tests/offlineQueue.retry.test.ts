// Tests for offlineQueue retry behavior using retryQueueItem
import * as SecureStore from 'expo-secure-store';
import { _test_setQueue, getQueue, retryQueueItem } from '../lib/offlineQueue';

describe('offlineQueue retry behavior', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    // clear persisted queue before each test
    await _test_setQueue([]);
  });

  test('retryQueueItem requeues on network failure and succeeds when fetch recovers', async () => {
    // Seed the queue using the module-provided test helper
    const id = `${Date.now()}-testid`;
    const seeded = [{ id, method: 'POST', endpoint: '/requests', body: { title: 'x' }, attempts: 0, createdAt: Date.now() }];
    await _test_setQueue(seeded as any);

    // mock token
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue('t');

    // first attempt: fetch throws (network)
    // @ts-ignore
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network'))
      // second attempt: fetch resolves ok
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ request: { id: 'srv-1', title: 'from-server' } }) });

    const first = await retryQueueItem(id);
    expect(first.ok).toBe(false);
    expect(first.error || first.status || first).toBeDefined();

    // queue should contain the item again
    const qAfter = await getQueue();
    expect(qAfter.find((x: any) => x.id === id)).toBeDefined();

    // retry again - now fetch will resolve
    const second = await retryQueueItem(id);
    expect(second.ok).toBe(true);

    const qFinal = await getQueue();
    expect(qFinal.length).toBe(0);
  });
});
