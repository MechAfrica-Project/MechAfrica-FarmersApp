// Tests for authStore.verifyOtp flow
jest.mock('@/lib/api', () => ({ apiFetch: jest.fn(), setAuthToken: jest.fn() }));
import { apiFetch, setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useFarmerStore } from '@/stores/farmerStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRequestsStore } from '@/stores/requestsStore';
import * as SecureStore from 'expo-secure-store';

describe('authStore behavior', () => {
  beforeEach(() => {
    // prevent background fetches during tests
    try {
      useRequestsStore.setState({ fetchRequests: async () => {} } as any);
      useFarmerStore.setState({ fetchProfile: async () => {} } as any);
      useNotificationStore.setState({ fetchNotifications: async () => {} } as any);
    } catch {
      // ignore
    }
    jest.resetAllMocks();
  });

  test('verifyOtp persists token and sets auth token', async () => {
    // set phone in auth store
    useAuthStore.setState({ phone: { raw: '+123', valid: true, country: 'US' } as any });

    // mock apiFetch to return token
    (apiFetch as jest.Mock).mockResolvedValueOnce({ token: 'tok-1', user: { id: 'u1', name: 'User' } });
    const spy = jest.spyOn(SecureStore, 'setItemAsync').mockResolvedValue(undefined as unknown as void);

    const res = await useAuthStore.getState().verifyOtp('0000');
    expect(res).toBe(true);
    expect(setAuthToken).toHaveBeenCalledWith('tok-1');
    expect(spy).toHaveBeenCalled();
  });
});
