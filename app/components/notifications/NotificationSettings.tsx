// app/components/notifications/NotificationSettings.tsx
// Notification settings screen for managing user notification preferences

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Mail, MessageSquare, Phone, Smartphone, Volume2, Clock, Moon } from 'lucide-react-native';
import { router } from 'expo-router';
import { notificationService } from '@/lib/notificationService';
import { UserNotificationPreferences } from '@/types/notification';
import { toastSuccess, toastError, toastConfirm } from '@/lib/toast';

// Default preferences structure
const defaultPreferences: Partial<UserNotificationPreferences> = {
  enable_notifications: true,
  preferred_language: 'English',
  time_zone: 'Africa/Accra',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '06:00',
  weekend_notifications: true,
  sms_enabled: true,
  email_enabled: true,
  whatsapp_enabled: true,
  push_enabled: true,
  in_app_enabled: true,
  voice_call_enabled: false,
  digest_frequency: 'never',
  max_notifications_day: 50,
  batch_notifications: false,
  batch_interval: 15,
  location_based_notifications: false,
  personalized_content: true,
  notification_history: true,
};

// Channel configuration
interface ChannelConfig {
  key: keyof Pick<UserNotificationPreferences,
    'sms_enabled' | 'email_enabled' | 'whatsapp_enabled' |
    'push_enabled' | 'in_app_enabled' | 'voice_call_enabled'>;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const channelConfigs: ChannelConfig[] = [
  {
    key: 'push_enabled',
    label: 'Push Notifications',
    description: 'Receive notifications on your device',
    icon: <Smartphone size={20} color="#166534" />,
  },
  {
    key: 'in_app_enabled',
    label: 'In-App Notifications',
    description: 'See notifications within the app',
    icon: <Bell size={20} color="#166534" />,
  },
  {
    key: 'sms_enabled',
    label: 'SMS',
    description: 'Receive text messages',
    icon: <MessageSquare size={20} color="#166534" />,
  },
  {
    key: 'email_enabled',
    label: 'Email',
    description: 'Receive email notifications',
    icon: <Mail size={20} color="#166534" />,
  },
  {
    key: 'whatsapp_enabled',
    label: 'WhatsApp',
    description: 'Receive WhatsApp messages',
    icon: <Phone size={20} color="#166534" />,
  },
  {
    key: 'voice_call_enabled',
    label: 'Voice Calls',
    description: 'Receive automated voice calls for urgent alerts',
    icon: <Volume2 size={20} color="#166534" />,
  },
];

// Section header component
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <View className="mb-3 mt-6">
    <Text className="text-lg font-bold text-gray-900">{title}</Text>
    {subtitle && (
      <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
    )}
  </View>
);

// Toggle setting row component
const SettingToggle: React.FC<{
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ label, description, value, onValueChange, disabled, icon }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
    <View className="flex-row items-center flex-1 pr-4">
      {icon && <View className="mr-3">{icon}</View>}
      <View className="flex-1">
        <Text className={`text-base font-medium ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>
          {label}
        </Text>
        {description && (
          <Text className={`text-sm mt-0.5 ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
            {description}
          </Text>
        )}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
      thumbColor={value ? '#166534' : '#9CA3AF'}
      ios_backgroundColor="#D1D5DB"
    />
  </View>
);

// Time picker button component
const TimePickerButton: React.FC<{
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}> = ({ label, value, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`flex-row items-center justify-between py-3 px-4 rounded-xl ${disabled ? 'bg-gray-100' : 'bg-gray-50'
      }`}
    activeOpacity={0.7}
  >
    <Text className={`text-base ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
      {label}
    </Text>
    <View className="flex-row items-center">
      <Clock size={16} color={disabled ? '#9CA3AF' : '#166534'} />
      <Text className={`ml-2 font-semibold ${disabled ? 'text-gray-400' : 'text-green-700'}`}>
        {value}
      </Text>
    </View>
  </TouchableOpacity>
);

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<Partial<UserNotificationPreferences>>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const response = await notificationService.getPreferences();
        if (response.success && response.data) {
          setPreferences(response.data);
        }
      } catch (err) {
        console.warn('Failed to load notification preferences:', err);
        // Use defaults if API fails
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Handle preference change
  const handlePreferenceChange = useCallback(
    <K extends keyof UserNotificationPreferences>(
      key: K,
      value: UserNotificationPreferences[K]
    ) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
      setHasChanges(true);
    },
    []
  );

  // Save preferences to API
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await notificationService.updatePreferences(preferences);
      setHasChanges(false);
      toastSuccess('Settings saved', 'Your notification preferences have been saved.');
    } catch (err: any) {
      toastError(
        'Save failed',
        err?.message || 'Failed to save preferences. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (hasChanges) {
      toastConfirm(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before leaving?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async () => {
              await handleSave();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [hasChanges, handleSave]);

  // Send test notification
  const handleTestNotification = useCallback(async () => {
    try {
      await notificationService.sendTestNotification();
      toastSuccess('Test sent', 'A test notification has been sent to your enabled channels.');
    } catch (err: any) {
      toastError('Test failed', err?.message || 'Failed to send test notification.');
    }
  }, []);

  // Show time picker info (placeholder - would use a proper time picker in production)
  const showTimePicker = useCallback((type: 'start' | 'end') => {
    toastConfirm(
      `Set ${type === 'start' ? 'Start' : 'End'} Time`,
      'Time picker would appear here. For now, quiet hours are set to 10 PM - 6 AM.',
      [{ text: 'OK' }]
    );
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#166534" />
          <Text className="text-gray-500 mt-4">Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const notificationsEnabled = preferences.enable_notifications ?? true;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2 -ml-2 mr-2"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#166534" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Notification Settings</Text>
        </View>
        {hasChanges && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-700 rounded-full"
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Save</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <View className="bg-green-50 rounded-2xl p-4 mb-4">
          <SettingToggle
            label="Enable Notifications"
            description="Turn all notifications on or off"
            value={notificationsEnabled}
            onValueChange={(value) => handlePreferenceChange('enable_notifications', value)}
            icon={<Bell size={24} color="#166534" />}
          />
        </View>

        {/* Notification Channels */}
        <SectionHeader
          title="Notification Channels"
          subtitle="Choose how you want to receive notifications"
        />
        <View className="bg-white rounded-2xl border border-gray-100 px-4">
          {channelConfigs.map((channel) => (
            <SettingToggle
              key={channel.key}
              label={channel.label}
              description={channel.description}
              value={preferences[channel.key] ?? false}
              onValueChange={(value) => handlePreferenceChange(channel.key, value)}
              disabled={!notificationsEnabled}
              icon={channel.icon}
            />
          ))}
        </View>

        {/* Quiet Hours */}
        <SectionHeader
          title="Quiet Hours"
          subtitle="Silence notifications during specific times"
        />
        <View className="bg-white rounded-2xl border border-gray-100 p-4">
          <SettingToggle
            label="Enable Quiet Hours"
            description="Pause notifications during set hours"
            value={preferences.quiet_hours_enabled ?? false}
            onValueChange={(value) => handlePreferenceChange('quiet_hours_enabled', value)}
            disabled={!notificationsEnabled}
            icon={<Moon size={20} color="#166534" />}
          />

          {preferences.quiet_hours_enabled && (
            <View className="mt-4 space-y-3">
              <TimePickerButton
                label="Start Time"
                value={preferences.quiet_hours_start ?? '22:00'}
                onPress={() => showTimePicker('start')}
                disabled={!notificationsEnabled}
              />
              <View className="h-2" />
              <TimePickerButton
                label="End Time"
                value={preferences.quiet_hours_end ?? '06:00'}
                onPress={() => showTimePicker('end')}
                disabled={!notificationsEnabled}
              />
            </View>
          )}
        </View>

        {/* Additional Settings */}
        <SectionHeader
          title="Additional Settings"
          subtitle="Customize your notification experience"
        />
        <View className="bg-white rounded-2xl border border-gray-100 px-4">
          <SettingToggle
            label="Weekend Notifications"
            description="Receive notifications on weekends"
            value={preferences.weekend_notifications ?? true}
            onValueChange={(value) => handlePreferenceChange('weekend_notifications', value)}
            disabled={!notificationsEnabled}
          />
          <SettingToggle
            label="Personalized Content"
            description="Receive notifications tailored to your activity"
            value={preferences.personalized_content ?? true}
            onValueChange={(value) => handlePreferenceChange('personalized_content', value)}
            disabled={!notificationsEnabled}
          />
          <SettingToggle
            label="Location-Based Alerts"
            description="Get relevant notifications based on your location"
            value={preferences.location_based_notifications ?? false}
            onValueChange={(value) => handlePreferenceChange('location_based_notifications', value)}
            disabled={!notificationsEnabled}
          />
          <SettingToggle
            label="Keep Notification History"
            description="Save notification history for later viewing"
            value={preferences.notification_history ?? true}
            onValueChange={(value) => handlePreferenceChange('notification_history', value)}
            disabled={!notificationsEnabled}
          />
        </View>

        {/* Test Notification Button */}
        <View className="mt-8">
          <TouchableOpacity
            onPress={handleTestNotification}
            disabled={!notificationsEnabled}
            className={`py-4 rounded-xl items-center ${notificationsEnabled ? 'bg-gray-100' : 'bg-gray-50'
              }`}
            activeOpacity={0.7}
          >
            <Text
              className={`font-semibold ${notificationsEnabled ? 'text-gray-700' : 'text-gray-400'
                }`}
            >
              Send Test Notification
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info text */}
        <Text className="text-center text-gray-400 text-sm mt-6 px-4">
          Note: Some notification preferences may be managed by your device settings.
          Critical security alerts will always be delivered.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettings;
