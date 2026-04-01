import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { apiFetch } from '../lib/api';

export type AppVersionCheckState = {
  isChecking: boolean;
  otaUpdateAvailable: boolean;
  otaIsDownloading: boolean;
  storeUpdateRequired: boolean;
  storeUpdateOptional: boolean;
  storeUrl: string | null;
  updateMessage: string | null;
};

export function useAppUpdateCheck(appName: 'farmers' | 'providers') {
  const [state, setState] = useState<AppVersionCheckState>({
    isChecking: true,
    otaUpdateAvailable: false,
    otaIsDownloading: false,
    storeUpdateRequired: false,
    storeUpdateOptional: false,
    storeUrl: null,
    updateMessage: null,
  });

  // Helper to compare semantic versions (e.g. 1.0.0 vs 1.1.0)
  // Returns 1 if v1 > v2, -1 if v1 < v2, 0 if v1 == v2
  const compareVersions = (v1: string, v2: string) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

  const checkUpdates = async () => {
    try {
      setState(prev => ({ ...prev, isChecking: true }));

      // 1. Check Store Version (Native binary updates)
      // expo-constants is always available; falls back to '1.0.0' in dev builds
      const currentVersion = Constants.expoConfig?.version ?? '1.0.0';
      const response = await apiFetch<any>(`/app/version?app=${appName}`);

      const {
        min_version,
        latest_version,
        store_url_ios,
        store_url_android,
        update_message,
      } = response;

      const needsForceUpdate = compareVersions(min_version, currentVersion) > 0;
      const needsSoftUpdate = compareVersions(latest_version, currentVersion) > 0;
      const storeUrl = Platform.OS === 'ios' ? store_url_ios : store_url_android;

      if (needsForceUpdate || needsSoftUpdate) {
        // Native update required — no point doing OTA check
        setState(prev => ({
          ...prev,
          isChecking: false,
          storeUpdateRequired: needsForceUpdate,
          storeUpdateOptional: needsSoftUpdate && !needsForceUpdate,
          storeUrl,
          updateMessage: update_message,
        }));
        return;
      }

      // 2. Check OTA Updates (JS bundle updates via expo-updates)
      if (!__DEV__) {
        try {
          const updateCheck = await Updates.checkForUpdateAsync();
          if (updateCheck.isAvailable) {
            setState(prev => ({ ...prev, otaUpdateAvailable: true, otaIsDownloading: true }));
            await Updates.fetchUpdateAsync();
            setState(prev => ({ ...prev, otaIsDownloading: false }));
          }
        } catch (e) {
          console.log('[Updates] Error checking for OTA updates:', e);
        }
      }

      setState(prev => ({ ...prev, isChecking: false }));
    } catch (error) {
      console.log('[Updates] Failed to check for app updates:', error);
      setState(prev => ({ ...prev, isChecking: false }));
    }
  };

  // Check on initial mount and when app returns to foreground
  useEffect(() => {
    checkUpdates();
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkUpdates();
      }
    });
    return () => subscription.remove();
  }, []);

  const triggerOtaRestart = async () => {
    await Updates.reloadAsync();
  };

  const dismissSoftUpdate = () => {
    setState(prev => ({ ...prev, storeUpdateOptional: false }));
  };

  return {
    ...state,
    triggerOtaRestart,
    dismissSoftUpdate,
    manualCheck: checkUpdates,
  };
}
