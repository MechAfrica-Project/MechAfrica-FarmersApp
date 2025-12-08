// types/notification.ts
// Comprehensive notification types matching the MechAfrica Notification API specification

/**
 * Notification types supported by the system
 */
export type NotificationType =
  | 'service_request'
  | 'payment'
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'service_completion'
  | 'rating_request'
  | 'promotion'
  | 'system_update'
  | 'weather_alert'
  | 'price_update'
  | 'new_service'
  | 'maintenance_reminder'
  | 'security_alert'
  | 'verification_update';

/**
 * Notification delivery channels
 */
export type NotificationChannel =
  | 'sms'
  | 'email'
  | 'whatsapp'
  | 'push'
  | 'in_app'
  | 'voice_call';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Notification delivery status
 */
export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled';

/**
 * Digest frequency options for notification preferences
 */
export type DigestFrequency = 'never' | 'daily' | 'weekly' | 'monthly';

/**
 * Notification frequency options
 */
export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly';

/**
 * Metadata that may be attached to service request notifications
 */
export interface ServiceRequestMetadata {
  request_id?: string;
  request_ref?: string;
  service_type?: string;
  provider_id?: string;
  provider_name?: string;
  notification_type?: string;
  [key: string]: any;
}

/**
 * Main notification data structure from the API
 */
export interface UserNotification {
  id: string;
  user_id: string;
  template_id: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;

  // Content
  title: string;
  message: string;
  action_url: string;
  action_label: string;
  metadata: ServiceRequestMetadata | Record<string, any>;

  // Scheduling
  scheduled_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  expires_at: string | null;

  // Delivery Information
  delivery_attempts: number;
  max_attempts: number;
  error_message: string;
  external_id: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * User notification preferences
 */
export interface UserNotificationPreferences {
  id: string;
  user_id: string;

  // Global Settings
  enable_notifications: boolean;
  preferred_language: string;
  time_zone: string;

  // Quiet Hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // Format: "HH:mm" (e.g., "22:00")
  quiet_hours_end: string; // Format: "HH:mm" (e.g., "06:00")

  // Weekend Settings
  weekend_notifications: boolean;

  // Channel Preferences
  sms_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  voice_call_enabled: boolean;

  // Contact Information
  sms_number: string;
  email_address: string;
  whatsapp_number: string;
  alternate_phone: string;
  alternate_email: string;

  // Frequency Settings
  digest_frequency: DigestFrequency;
  max_notifications_day: number;
  batch_notifications: boolean;
  batch_interval: number; // minutes

  // Advanced Settings
  location_based_notifications: boolean;
  personalized_content: boolean;
  notification_history: boolean;
}

/**
 * Per-type notification preference
 */
export interface NotificationPreference {
  enabled: boolean;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  frequency: NotificationFrequency;
}

/**
 * Notification statistics from the API
 */
export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  by_type: {
    type: NotificationType;
    count: number;
  }[];
  recent: number;
}

/**
 * API response for notifications list
 */
export interface NotificationsListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: UserNotification[];
    unread_count: number;
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * API response for single notification
 */
export interface NotificationResponse {
  success: boolean;
  message: string;
  data: UserNotification;
}

/**
 * API response for unread count
 */
export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
  };
}

/**
 * API response for notification stats
 */
export interface NotificationStatsResponse {
  success: boolean;
  message: string;
  data: NotificationStats;
}

/**
 * Generic API response for actions (mark read, delete, etc.)
 */
export interface NotificationActionResponse {
  success: boolean;
  message: string;
  data: null;
}

/**
 * Query parameters for fetching notifications
 */
export interface NotificationsQueryParams {
  limit?: number;
  offset?: number;
  type?: NotificationType;
}

/**
 * Filter type for the UI (includes 'all' option)
 */
export type NotificationFilterType = 'all' | NotificationType;

/**
 * Legacy notification item type (for backwards compatibility with existing code)
 * Maps to the simplified structure used in the current store
 */
export interface LegacyNotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'request' | 'system';
  read: boolean;
}

/**
 * Helper function to convert API notification to legacy format
 */
export function toLegacyNotification(notification: UserNotification): LegacyNotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.message,
    time: notification.created_at,
    type: notification.type === 'service_request' ? 'request' : 'system',
    read: notification.read_at !== null || notification.status === 'read',
  };
}

/**
 * Helper function to check if a notification is read
 */
export function isNotificationRead(notification: UserNotification): boolean {
  return notification.read_at !== null || notification.status === 'read';
}

/**
 * Helper function to get priority color
 */
export function getPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'critical':
      return '#EF4444'; // red
    case 'high':
      return '#F97316'; // orange
    case 'normal':
      return '#3B82F6'; // blue
    case 'low':
      return '#6B7280'; // gray
    default:
      return '#3B82F6'; // blue
  }
}

/**
 * Helper function to get notification type display label
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    service_request: 'Service Request',
    payment: 'Payment',
    booking_confirmation: 'Booking Confirmed',
    booking_reminder: 'Reminder',
    service_completion: 'Completed',
    rating_request: 'Rate Service',
    promotion: 'Promotion',
    system_update: 'System Update',
    weather_alert: 'Weather Alert',
    price_update: 'Price Update',
    new_service: 'New Service',
    maintenance_reminder: 'Maintenance',
    security_alert: 'Security',
    verification_update: 'Verification',
  };
  return labels[type] || type;
}

/**
 * Helper function to get notification type badge color class
 */
export function getNotificationTypeBadgeClass(type: NotificationType): string {
  const classes: Record<NotificationType, string> = {
    service_request: 'bg-green-100 text-green-800',
    payment: 'bg-blue-100 text-blue-800',
    booking_confirmation: 'bg-emerald-100 text-emerald-800',
    booking_reminder: 'bg-yellow-100 text-yellow-800',
    service_completion: 'bg-teal-100 text-teal-800',
    rating_request: 'bg-purple-100 text-purple-800',
    promotion: 'bg-pink-100 text-pink-800',
    system_update: 'bg-gray-100 text-gray-800',
    weather_alert: 'bg-orange-100 text-orange-800',
    price_update: 'bg-indigo-100 text-indigo-800',
    new_service: 'bg-cyan-100 text-cyan-800',
    maintenance_reminder: 'bg-amber-100 text-amber-800',
    security_alert: 'bg-red-100 text-red-800',
    verification_update: 'bg-lime-100 text-lime-800',
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Helper function to format notification time for display
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

// ============================================================================
// PUSH NOTIFICATION TYPES
// ============================================================================

/**
 * App type for push token registration
 */
export type PushAppType = 'farmer' | 'service_provider' | 'agent';

/**
 * Platform type for push notifications
 */
export type PushPlatform = 'ios' | 'android' | 'web';

/**
 * Push token status
 */
export type PushTokenStatus = 'active' | 'inactive' | 'expired' | 'invalid';

/**
 * Push notification types sent by the system
 */
export type PushNotificationType =
  | 'request_accepted'
  | 'request_declined'
  | 'work_started'
  | 'work_completed'
  | 'request_cancelled'
  | 'new_request'
  | 'payment_received'
  | 'weather_alert'
  | 'system_alert'
  | 'test';

/**
 * Request body for registering a push token
 */
export interface RegisterPushTokenRequest {
  push_token: string;
  app_type: PushAppType;
  platform: PushPlatform;
  device_id?: string;
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  app_build_number?: string;
}

/**
 * Response data from push token registration
 */
export interface PushTokenData {
  token_id: string;
  push_token: string;
  app_type: PushAppType;
  platform: PushPlatform;
  is_active: boolean;
}

/**
 * Response from registering a push token
 */
export interface RegisterPushTokenResponse {
  success: boolean;
  message: string;
  data: PushTokenData;
}

/**
 * Full push token information from GET endpoint
 */
export interface UserPushToken {
  id: string;
  push_token: string;
  app_type: PushAppType;
  platform: PushPlatform;
  device_id?: string;
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  status: PushTokenStatus;
  is_active: boolean;
  created_at: string;
  last_used?: string;
  notifications_sent?: number;
  notifications_failed?: number;
}

/**
 * Response from getting user's push tokens
 */
export interface GetPushTokensResponse {
  success: boolean;
  message: string;
  data: {
    tokens: UserPushToken[];
    count: number;
  };
}

/**
 * Request body for unregistering a push token
 */
export interface UnregisterPushTokenRequest {
  push_token: string;
}

/**
 * Generic push action response
 */
export interface PushActionResponse {
  success: boolean;
  message: string;
  data: null;
}

/**
 * Response from sending a test notification
 */
export interface TestNotificationResponse {
  success: boolean;
  message: string;
  data: {
    tickets_count: number;
  };
}

/**
 * Data payload in push notifications
 */
export interface PushNotificationData {
  type: PushNotificationType;
  request_id?: string;
  notification_id?: string;
  action_url?: string;
  [key: string]: any;
}

/**
 * Push notification content structure (from Expo)
 */
export interface PushNotificationContent {
  title?: string;
  body?: string;
  data?: PushNotificationData;
  badge?: number;
  sound?: string | boolean;
}

/**
 * Android notification channel configuration
 */
export interface AndroidNotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: 'default' | 'high' | 'low' | 'max' | 'min' | 'none';
  sound?: string;
  vibrationPattern?: number[];
  lightColor?: string;
}

/**
 * Default Android channels for MechAfrica
 */
export const DEFAULT_ANDROID_CHANNELS: AndroidNotificationChannel[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'General notifications',
    importance: 'high',
  },
  {
    id: 'service_requests',
    name: 'Service Requests',
    description: 'Notifications about service requests',
    importance: 'high',
    sound: 'default',
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Payment notifications',
    importance: 'high',
    sound: 'default',
  },
  {
    id: 'weather_alerts',
    name: 'Weather Alerts',
    description: 'Weather warning notifications',
    importance: 'max',
    sound: 'default',
  },
  {
    id: 'system',
    name: 'System',
    description: 'System announcements',
    importance: 'default',
  },
];

/**
 * Helper to get appropriate channel for notification type
 */
export function getChannelForNotificationType(type: PushNotificationType): string {
  switch (type) {
    case 'request_accepted':
    case 'request_declined':
    case 'work_started':
    case 'work_completed':
    case 'request_cancelled':
    case 'new_request':
      return 'service_requests';
    case 'payment_received':
      return 'payments';
    case 'weather_alert':
      return 'weather_alerts';
    case 'system_alert':
      return 'system';
    default:
      return 'default';
  }
}
