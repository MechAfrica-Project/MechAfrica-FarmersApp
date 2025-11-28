// Tests for apiFetch retry-on-401 and refresh behavior
describe('apiFetch refresh retry', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    // @ts-ignore
    global.fetch = undefined;
  });

  test('retries request after successful refresh and updates token', async () => {
    // ensure online
    jest.doMock('@/stores/uiStore', () => ({ useUIStore: { getState: () => ({ online: true }) } }));

    // fetch sequence: 1) original request -> 401
    //                 2) refresh request -> 200 with new accessToken
    //                 3) retried original request -> 200 with data
    // @ts-ignore
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, text: async () => 'unauth', headers: { get: () => 'application/json' } })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ accessToken: 'new-token', refreshToken: 'new-refresh' }), headers: { get: () => 'application/json' } })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true }), headers: { get: () => 'application/json' } });

    const api = await import('@/lib/api');
    // seed a refresh token so doRefresh attempts to call refresh
    await api.setTokens(null, 'old-refresh');

    const { apiFetch } = await import('@/lib/api');
    const res = await apiFetch('/protected');
    expect(res).toMatchObject({ success: true });

    // token should be updated in memory
    expect(api.getAuthToken()).toBe('new-token');
  });
});
