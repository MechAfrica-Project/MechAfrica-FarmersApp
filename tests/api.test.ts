// Tests for lib/api.ts behavior using per-test module mocking
describe('apiFetch wrapper', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    // clear global fetch
    // @ts-ignore
    global.fetch = undefined;
  });

  test('returns queued response when offline for write requests', async () => {
    jest.doMock('@/lib/offlineQueue', () => ({ enqueueRequest: async () => 'queued-1' }));
    jest.doMock('@/stores/uiStore', () => ({ useUIStore: { getState: () => ({ online: false }) } }));

    const { apiFetch } = await import('@/lib/api');
    const res = await apiFetch('/test', { method: 'POST', body: JSON.stringify({ a: 1 }) }) as any;
    expect(res).toHaveProperty('queued', true);
    expect(res).toHaveProperty('queuedId', 'queued-1');
  });

  test('throws ApiError on non-ok response with parsed message', async () => {
    jest.doMock('@/stores/uiStore', () => ({ useUIStore: { getState: () => ({ online: true }) } }));
    // mock fetch to return non-ok with JSON message
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, text: async () => JSON.stringify({ message: 'oops' }), headers: { get: () => 'application/json' } });

    const { apiFetch, ApiError } = await import('@/lib/api');
    await expect(apiFetch('/err')).rejects.toThrow(ApiError);
    try {
      await apiFetch('/err');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(500);
      expect(e.body).toMatchObject({ message: 'oops' });
    }
  });

  test('throws parse error when json parsing fails', async () => {
    jest.doMock('@/stores/uiStore', () => ({ useUIStore: { getState: () => ({ online: true }) } }));
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => { throw new Error('bad json'); }, text: async () => 'invalid' });

    const { apiFetch, ApiError } = await import('@/lib/api');
    await expect(apiFetch('/badjson')).rejects.toThrow(ApiError);
  });
});
