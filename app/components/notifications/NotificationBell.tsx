// app/components/notifications/NotificationBell.tsx
// Notification bell icon with unread count badge for headers and navigation

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUnreadCount } from '@/utils/useNotifications';

interface NotificationBellProps {
  /** Size of the bell icon */
  size?: number;
  /** Color of the bell icon */
  color?: string;
  /** Whether to enable polling for unread count updates */
  enablePolling?: boolean;
  /** Custom onPress handler (overrides default navigation) */
  onPress?: () => void;
  /** Custom style for the container */
  style?: object;
  /** Maximum count to display (shows "99+" if exceeded) */
  maxCount?: number;
}

/**
 * NotificationBell Component
 *
 * Displays a bell icon with an unread notification count badge.
 * Automatically polls for unread count updates when enablePolling is true.
 *
 * @example
 * ```tsx
 * // In a header component
 * <NotificationBell size={24} color="#1F2937" enablePolling />
 *
 * // With custom press handler
 * <NotificationBell
 *   onPress={() => setShowNotificationSheet(true)}
 *   color="#FFFFFF"
 * />
 * ```
 */
const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 24,
  color = '#1F2937',
  enablePolling = true,
  onPress,
  style,
  maxCount = 99,
}) => {
  const unreadCount = useUnreadCount(enablePolling);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to notifications screen
      router.push('/notifications');
    }
  }, [onPress]);

  // Format the badge count
  const getBadgeText = () => {
    if (unreadCount <= 0) return null;
    if (unreadCount > maxCount) return `${maxCount}+`;
    return unreadCount.toString();
  };

  const badgeText = getBadgeText();

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      activeOpacity={0.7}
      accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      accessibilityRole="button"
    >
      <Bell size={size} color={color} />
      {badgeText && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default NotificationBell;
