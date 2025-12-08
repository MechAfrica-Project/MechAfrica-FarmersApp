// lib/pushNotifications.ts
// Push notification service using Expo Notifications

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';
import { API_ENDPOINTS } from './apiEndpoints';

// Storage keys
const PUSH_TOKEN_KEY = '@mechafrica:pushToken';
const PUSH_TOKEN_REGISTERED_KEY = '@mechafrica:pushTokenRegistered';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * App type for push notifications
 */
export type AppType = 'farmer' | 'service_provider' | 'agent';

/**
 * Push token registration request
 */
export interface PushTokenRegistration {
  push_token: string;
  app_type: AppType;
  platform: 'ios' | 'android' | 'web';
  device_id?: string;
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  app_build_number?: string;
}

/**
 * Push token response from API
 */
export interface PushTokenResponse {
  success: boolean;
  message: string;
  data: {
    token_id: string;
    push_token: string;
    app_type: AppType;
    platform: string;
    is_active: boolean;
  };
}

/**
 * Notification data payload
 */
export interface NotificationData {
  type: string;
  request_id?: string;
  service_type?: string;
  provider_id?: string;
  farmer_id?: string;
  [key: string]: any;
}

/**
 * Setup Android notification channels
 */
async function setupAndroidChannels() {
  if (Platform.OS !== 'android') return;

  try {
    // Default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#166534',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });

    // Service requests channel
    await Notifications.setNotificationChannelAsync('service_requests', {
      name: 'Service Requests',
      description: 'Notifications about service requests',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      enableLights: true,
      lightColor: '#166534',
    });

    // Payments channel
    await Notifications.setNotificationChannelAsync('payments', {
      name: 'Payments',
      description: 'Payment and transaction notifications',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      lightColor: '#10B981',
    });

    // System alerts channel
    await Notifications.setNotificationChannelAsync('system_alerts', {
      name: 'System Alerts',
      description: 'Important system notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });

    // Weather alerts channel
    await Notifications.setNotificationChannelAsync('weather_alerts', {
      name: 'Weather Alerts',
      description: 'Weather warnings and alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#F59E0B',
    });

    console.log('Android notification channels configured');
  } catch (error) {
    console.error('Failed to setup Android notification channels:', error);
  }
}

/**
 * Get the Expo push token
 * Returns null if:
 * - Not running on a physical device
 * - User denied permissions
 * - Failed to get token
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // Must be a physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Setup Android channels before getting token
    await setupAndroidChannels();

    // Get the token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn('Expo project ID not found. Push notifications may not work correctly.');
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data;

    // Store token locally
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    console.log('Expo push token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}

/**
 * Get device information for registration
 */
async function getDeviceInfo() {
  try {
    return {
      device_name: Device.deviceName || 'Unknown Device',
      device_model: Device.modelName || 'Unknown Model',
      os_version: Device.osVersion || 'Unknown',
      platform: Platform.OS as 'ios' | 'android' | 'web',
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      device_name: 'Unknown',
      device_model: 'Unknown',
      os_version: 'Unknown',
      platform: Platform.OS as 'ios' | 'android' | 'web',
    };
  }
}

/**
 * Register push token with backend
 * @param appType - Type of app (farmer, service_provider, agent)
 * @param forceRefresh - Force getting a new token even if one exists
 * @returns true if successful
 */
export async function registerPushToken(
  appType: AppType = 'farmer',
  forceRefresh: boolean = false
): Promise<boolean> {
  try {
    // Get or refresh push token
    let pushToken: string | null = null;

    if (!forceRefresh) {
      // Try to get stored token first
      pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    }

    if (!pushToken || forceRefresh) {
      // Get new token from Expo
      pushToken = await getExpoPushToken();
    }

    if (!pushToken) {
      console.warn('No push token available for registration');
      return false;
    }

    // Get device info
    const deviceInfo = await getDeviceInfo();

    // Get app version info
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const appBuildNumber = Constants.expoConfig?.ios?.buildNumber ||
      Constants.expoConfig?.android?.versionCode?.toString() ||
      '1';

    // Prepare registration data
    const registrationData: PushTokenRegistration = {
      push_token: pushToken,
      app_type: appType,
      platform: deviceInfo.platform,
      device_name: deviceInfo.device_name,
      device_model: deviceInfo.device_model,
      os_version: deviceInfo.os_version,
      app_version: appVersion,
      app_build_number: appBuildNumber,
    };

    // Register with backend
    const response = await apiFetch<PushTokenResponse>(
      API_ENDPOINTS.PUSH_TOKEN_REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(registrationData),
      }
    );

    if (response.success) {
      // Mark as registered
      await AsyncStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, 'true');
      console.log('Push token registered successfully');
      return true;
    } else {
      console.error('Failed to register push token:', response.message);
      return false;
    }
  } catch (error: any) {
    console.error('Error registering push token:', error);

    // If registration fails, mark as not registered
    await AsyncStorage.removeItem(PUSH_TOKEN_REGISTERED_KEY);
    return false;
  }
}

/**
 * Check if push token is registered
 */
export async function isPushTokenRegistered(): Promise<boolean> {
  try {
    const registered = await AsyncStorage.getItem(PUSH_TOKEN_REGISTERED_KEY);
    return registered === 'true';
  } catch {
    return false;
  }
}

/**
 * Unregister push token (call on logout)
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (!pushToken) {
      console.log('No push token to unregister');
      return;
    }

    // Call backend to deactivate all tokens
    await apiFetch<{ success: boolean; message: string }>(
      API_ENDPOINTS.PUSH_TOKEN_DEACTIVATE,
      {
        method: 'POST',
      }
    );

    // Clear local storage
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    await AsyncStorage.removeItem(PUSH_TOKEN_REGISTERED_KEY);

    console.log('Push token unregistered successfully');
  } catch (error) {
    console.error('Error unregistering push token:', error);
    // Clear local storage anyway
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    await AsyncStorage.removeItem(PUSH_TOKEN_REGISTERED_KEY);
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const response = await apiFetch<{ success: boolean; message: string }>(
      API_ENDPOINTS.PUSH_TEST,
      {
        method: 'POST',
      }
    );

    if (response.success) {
      console.log('Test notification sent successfully');
      return true;
    } else {
      console.error('Failed to send test notification:', response.message);
      return false;
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Get notification channel for a notification type
 */
export function getNotificationChannel(notificationType: string): string {
  switch (notificationType) {
    case 'request_accepted':
    case 'request_declined':
    case 'work_started':
    case 'work_completed':
    case 'new_request':
      return 'service_requests';
    case 'payment_received':
    case 'payment':
      return 'payments';
    case 'weather_alert':
      return 'weather_alerts';
    case 'system_alert':
    case 'system_update':
      return 'system_alerts';
    default:
      return 'default';
  }
}

/**
 * Schedule a local notification (for testing or offline scenarios)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  delaySeconds: number = 0
): Promise<string> {
  try {
    const content: Notifications.NotificationContentInput = {
      title,
      body,
      data: data || {},
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };

    // Add channelId for Android only
    if (Platform.OS === 'android' && data?.type) {
      (content as any).channelId = getNotificationChannel(data.type);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: (delaySeconds > 0 ? { seconds: delaySeconds } : null) as any,
    });

    console.log('Local notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelLocalNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllLocalNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge count:', error);
  }
}

/**
 * Dismiss all delivered notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('All notifications dismissed');
  } catch (error) {
    console.error('Error dismissing notifications:', error);
  }
}

/**
 * Get all delivered notifications
 */
export async function getDeliveredNotifications(): Promise<Notifications.Notification[]> {
  try {
    return await Notifications.getPresentedNotificationsAsync();
  } catch (error) {
    console.error('Error getting delivered notifications:', error);
    return [];
  }
}

export default {
  getExpoPushToken,
  registerPushToken,
  isPushTokenRegistered,
  unregisterPushToken,
  sendTestNotification,
  scheduleLocalNotification,
  cancelLocalNotification,
  cancelAllLocalNotifications,
  getBadgeCount,
  setBadgeCount,
  clearBadgeCount,
  dismissAllNotifications,
  getDeliveredNotifications,
  getNotificationChannel,
};
