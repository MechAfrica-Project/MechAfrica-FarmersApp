// app/components/notifications/index.ts
// Export all notification components for convenient importing

// Main notifications screen component
export { default as Notifications } from './notifications';

// Settings screen
export { default as NotificationSettings } from './NotificationSettings';

// Individual components
export { default as HeaderBar } from './components/HeaderBar';
export { default as FilterChips, convertLegacyFilter, convertToLegacyFilter } from './components/FilterChips';
export { default as UnreadBadge, UnreadBadgeCompact } from './components/UnreadBadge';
export { default as NotificationCard } from './components/NotificationCard';
export { default as NotificationBell } from './NotificationBell';
