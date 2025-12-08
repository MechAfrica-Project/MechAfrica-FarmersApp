// utils/usePushNotifications.ts
// React hook for managing push notifications with Expo

import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  registerPushToken,
  unregisterPushToken,
  isPushTokenRegistered,
  sendTestNotification as sendTest,
  setBadgeCount,
  clearBadgeCount,
  getExpoPushToken,
  AppType,
  NotificationData,
} from '@/lib/pushNotifications';
import { useNotificationStore } from '@/stores/notificationStore';

export interface UsePushNotificationsOptions {
  /** App type for token registration */
  appType?: AppType;
  /** Whether push notifications are enabled */
  enabled?: boolean;
  /** Auto-register token when enabled */
  autoRegister?: boolean;
  /** Auto-sync badge count with unread notifications */
  syncBadgeCount?: boolean;
  /** Callback when a notification is received in foreground */
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  /** Callback when user taps a notification */
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void;
}

export interface UsePushNotificationsResult {
  /** Current Expo push token */
  expoPushToken: string | null;
  /** Whether permissions are granted */
  hasPermission: boolean;
  /** Whether the token is registered with backend */
  isRegistered: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Request permissions manually */
  requestPermissions: () => Promise<boolean>;
  /** Register token with backend manually */
  registerToken: () => Promise<boolean>;
  /** Unregister token from backend */
  unregisterToken: () => Promise<void>;
  /** Send a test notification */
  sendTestNotification: () => Promise<boolean>;
  /** Update badge count */
  updateBadgeCount: (count: number) => Promise<void>;
  /** Clear badge count */
  clearBadge: () => Promise<void>;
}

/**
 * Hook for managing push notifications
 *
 * Features:
 * - Automatic token registration
 * - Permission handling
 * - Notification listeners
 * - Badge count management
 * - Navigation handling
 *
 * @example
 * ```tsx
 * const {
 *   expoPushToken,
 *   hasPermission,
 *   isRegistered,
 *   requestPermissions,
 * } = usePushNotifications({
 *   appType: 'farmer',
 *   enabled: true,
 *   autoRegister: true,
 * });
 * ```
 */
export function usePushNotifications(
  options: UsePushNotificationsOptions = {}
): UsePushNotificationsResult {
  const {
    appType = 'farmer',
    enabled = true,
    autoRegister = true,
    syncBadgeCount = true,
    onNotificationReceived,
    onNotificationResponse,
  } = options;

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Access notification store for badge sync
  const unreadCount = useNotificationStore((s) => s.unreadCount || 0);

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      return false;
    }
  }, []);

  // Get and register token
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!enabled) return false;

    setIsLoading(true);
    try {
      // Get token from Expo
      const token = await getExpoPushToken();
      if (token) {
        setExpoPushToken(token);

        // Register with backend
        const success = await registerPushToken(appType);
        setIsRegistered(success);
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [enabled, appType]);

  // Unregister token
  const unregisterToken = useCallback(async (): Promise<void> => {
    try {
      await unregisterPushToken();
      setExpoPushToken(null);
      setIsRegistered(false);
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    return sendTest();
  }, []);

  // Update badge count
  const updateBadgeCount = useCallback(async (count: number): Promise<void> => {
    await setBadgeCount(count);
  }, []);

  // Clear badge count
  const clearBadge = useCallback(async (): Promise<void> => {
    await clearBadgeCount();
  }, []);

  // Handle notification response (user tapped notification)
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      if (__DEV__) {
        console.log('Notification tapped:', response);
      }

      // Call custom handler if provided
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }

      // Handle navigation based on notification data
      const data = response.notification.request.content.data as NotificationData;

      if (data) {
        // Navigate based on notification type
        switch (data.type) {
          case 'request_accepted':
          case 'request_declined':
          case 'work_started':
          case 'work_completed':
          case 'request_cancelled':
            if (data.request_id) {
              // Navigate to service request details
              try {
                router.push(`/requests/${data.request_id}` as any);
              } catch {
                router.push('/requests' as any);
              }
            }
            break;

          case 'new_request':
            // Navigate to available requests (for providers)
            router.push('/services' as any);
            break;

          case 'payment_received':
          case 'payment':
            // Navigate to earnings/payments
            router.push('/profile' as any);
            break;

          case 'weather_alert':
            // Show weather info
            router.push('/(tabs)' as any);
            break;

          default:
            // Navigate to notifications screen
            router.push('/notifications' as any);
            break;
        }
      }
    },
    [onNotificationResponse]
  );

  // Initialize push notifications
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const initializePush = async () => {
      try {
        // Check current permission status
        const { status } = await Notifications.getPermissionsAsync();
        if (mounted) {
          setHasPermission(status === 'granted');
        }

        // Check if token is already registered
        const registered = await isPushTokenRegistered();
        if (mounted) {
          setIsRegistered(registered);
        }

        // Auto-register if enabled and we have permission
        if (autoRegister && status === 'granted') {
          await registerToken();
        }

        // Check if app was opened from a notification
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse && mounted) {
          handleNotificationResponse(lastResponse);
        }
      } catch (error) {
        console.error('Push notification initialization error:', error);
      }
    };

    initializePush();

    return () => {
      mounted = false;
    };
  }, [enabled, autoRegister, registerToken, handleNotificationResponse]);

  // Set up notification listeners
  useEffect(() => {
    if (!enabled) return;

    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (__DEV__) {
          console.log('Notification received in foreground:', notification);
        }

        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }

        // Note: Badge count is synced separately via useEffect
      }
    );

    // Listener for when user interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [enabled, onNotificationReceived, handleNotificationResponse, syncBadgeCount, unreadCount]);

  // Sync badge count with unread notifications
  useEffect(() => {
    if (!enabled || !syncBadgeCount) return;

    setBadgeCount(unreadCount).catch(() => { });
  }, [enabled, syncBadgeCount, unreadCount]);

  // Handle app state changes (refresh token when app becomes active)
  useEffect(() => {
    if (!enabled || !autoRegister) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground, refresh token registration if needed
        if (hasPermission && !isRegistered) {
          registerToken().catch(() => { });
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled, autoRegister, hasPermission, isRegistered, registerToken]);

  return {
    expoPushToken,
    hasPermission,
    isRegistered,
    isLoading,
    requestPermissions,
    registerToken,
    unregisterToken,
    sendTestNotification,
    updateBadgeCount,
    clearBadge,
  };
}

export default usePushNotifications;
