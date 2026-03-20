// Tests for notificationStore.fetchNotifications
import { apiFetch } from '@/lib/api';
import { useNotificationStore } from '@/stores/notificationStore';
jest.mock('@/lib/api', () => ({ apiFetch: jest.fn(), setAuthToken: jest.fn() }));

describe('notificationStore behavior', () => {
  afterEach(() => {
    jest.resetAllMocks();
    useNotificationStore.setState({ items: [] } as any);
  });

  test('fetchNotifications handles wrapped payload', async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({ notifications: [{ id: 'n1', title: 'hi', body: '', time: '', type: 'system', read: false }] });
    await useNotificationStore.getState().fetchNotifications();
    expect(useNotificationStore.getState().items.length).toBeGreaterThanOrEqual(1);
  });

  test('fetchNotifications handles array payload', async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce([{ id: 'n2', title: 'hey', body: '', time: '', type: 'system', read: false }]);
    await useNotificationStore.getState().fetchNotifications();
    expect(useNotificationStore.getState().items.find((n) => n.id === 'n2')).toBeDefined();
  });
});
