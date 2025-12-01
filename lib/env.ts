// Centralized environment helpers
// Use these functions to read environment variables consistently across the app.
export const API_URL_PLACEHOLDER = 'https://your-api.com';

// Canonical env names (prefer simple names). Keep backward compatibility with EXPO_PUBLIC_* variants.
export function resolveApiUrlRaw(): string | null {
  return (
    process.env.API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    null
  );
}

export function getApiUrlOrPlaceholder(): string {
  const url = resolveApiUrlRaw();
  if (!url || url === API_URL_PLACEHOLDER) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      return API_URL_PLACEHOLDER;
    }
    return API_URL_PLACEHOLDER;
  }
  return url.replace(/\/$/, '');
}

export function getGoogleMapsIosKey(): string {
  return (
    process.env.GOOGLE_MAPS_IOS_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY ||
    ''
  );
}

export function getGoogleMapsAndroidKey(): string {
  return (
    process.env.GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY ||
    ''
  );
}

export function getIntegrationPingPath(): string {
  return process.env.INTEGRATION_PING_PATH || process.env.EXPO_INTEGRATION_PING_PATH || '/health';
}

export function runIntegrationTestsFlag(): boolean {
  return String(process.env.RUN_INTEGRATION || '').toLowerCase() === 'true';
}

export function getNodeEnv(): string {
  return process.env.NODE_ENV || 'development';
}

export default {
  resolveApiUrlRaw,
  getApiUrlOrPlaceholder,
  getGoogleMapsIosKey,
  getGoogleMapsAndroidKey,
  getIntegrationPingPath,
  runIntegrationTestsFlag,
  getNodeEnv,
};
