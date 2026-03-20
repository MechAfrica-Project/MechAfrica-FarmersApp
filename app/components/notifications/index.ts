// app/components/notifications/index.ts
// Export all notification components for convenient importing
// Default export satisfies Expo Router (barrel files inside app/ need one)

import Notifications from './notifications';
export default Notifications;
export { Notifications };

// Settings screen
export { default as NotificationSettings } from './NotificationSettings';

// Individual components
export { default as HeaderBar } from './components/HeaderBar';
export { default as FilterChips } from './components/FilterChips';
export { default as UnreadBadge } from './components/UnreadBadge';
export { default as NotificationCard } from './components/NotificationCard';
export { default as NotificationBell } from './NotificationBell';
