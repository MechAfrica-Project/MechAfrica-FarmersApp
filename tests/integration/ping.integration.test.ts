const URL = process.env.EXPO_PUBLIC_API_URL;
const PING_PATH = process.env.EXPO_INTEGRATION_PING_PATH || '/health';

if (!URL) {
  test.skip('integration ping skipped: EXPO_PUBLIC_API_URL not set', () => {});
} else {
  test('integration ping: API responds 2xx', async () => {
    const res = await fetch(`${URL.replace(/\/$/, '')}${PING_PATH}`);
    expect(res.ok).toBeTruthy();
  });
}
