
const env = require('./lib/env.cjs');

env.loadDotenvSync();

const iosMapsKey = env.getGoogleMapsIosKey() || '';
const androidMapsKey = env.getGoogleMapsAndroidKey() || '';

// Warn if keys are missing (except in test environment)
if (!iosMapsKey && process.env.NODE_ENV !== 'test') {
  console.warn('WARN: Google Maps iOS API key not set (GOOGLE_MAPS_IOS_API_KEY or EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY).');
}

if (!androidMapsKey && process.env.NODE_ENV !== 'test') {
  console.warn('WARN: Google Maps Android API key not set (GOOGLE_MAPS_ANDROID_API_KEY or EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY).');
}

module.exports = ({ config }) => {
  // Support both shapes: some projects use a root config, others wrap inside { expo: ... }.
  const baseExpo = config.expo ?? config;

  const apiUrlRaw = env.resolveApiUrlRaw() || null;

  const nextExpo = {
    ...baseExpo,
    ios: {
      ...(baseExpo.ios ?? {}),
      config: {
        ...((baseExpo.ios ?? {}).config ?? {}),
        // Native Google Maps key injected at build-time from env (local .env or EAS env vars)
        googleMapsApiKey: iosMapsKey || ((baseExpo.ios ?? {}).config ?? {}).googleMapsApiKey || '',
      },
      infoPlist: {
        ...((baseExpo.ios ?? {}).infoPlist ?? {}),
        // Keep static safe default (Apple export compliance)
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      ...(baseExpo.android ?? {}),
      config: {
        ...((baseExpo.android ?? {}).config ?? {}),
        googleMaps: {
          ...((((baseExpo.android ?? {}).config ?? {}).googleMaps) ?? {}),
          // Native Google Maps key injected at build-time from env (local .env or EAS env vars)
          apiKey:
            androidMapsKey ||
            ((((baseExpo.android ?? {}).config ?? {}).googleMaps ?? {}).apiKey ?? '') ||
            '',
        },
      },
    },
    extra: {
      ...(baseExpo.extra ?? {}),
      // Expose API URL to the app (supports both old and new variable names for backward compatibility)
      apiUrl: apiUrlRaw,
      apiBaseUrl: apiUrlRaw,
    },
  };

  return config.expo ? { ...config, expo: nextExpo } : nextExpo;
};
