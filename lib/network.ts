import { useUIStore } from '@/stores/uiStore';

type Unsubscribe = (() => void) | null;

export async function startNetworkMonitoring(): Promise<Unsubscribe> {
  // try NetInfo first
  try {
    // optional dependency
    // @ts-ignore
    const NetInfo: any = await import('@react-native-community/netinfo');
    const sub = NetInfo.default.addEventListener((state: any) => {
      const isOnline = Boolean(state.isInternetReachable ?? state.isConnected);
      useUIStore.getState().setOnline(isOnline);
      if (isOnline) {
        // dynamic import inside callback (no await)
        // @ts-ignore
        import('@/lib/offlineQueue').then((m) => m.processQueue().catch(() => {})).catch(() => {});
      }
    });

    try {
      const s = await NetInfo.default.fetch();
      useUIStore.getState().setOnline(Boolean(s.isConnected ?? s.isInternetReachable ?? s.isConnected));
    } catch {}

    return () => {
      try {
        if (typeof sub === 'function') sub();
        else if (sub && typeof (sub as any).remove === 'function') (sub as any).remove();
      } catch {}
    };
  } catch {
    // try expo-network
  }

  try {
    // optional dependency
    // @ts-ignore
    const Network: any = await import('expo-network');
    let mounted = true;
    const update = async () => {
      try {
        const st = await (Network as any).getNetworkStateAsync();
        if (!mounted) return;
        const isOnline = Boolean(st.isInternetReachable ?? st.isConnected);
        useUIStore.getState().setOnline(isOnline);
        if (isOnline) {
          // dynamic import (no await)
          // @ts-ignore
          import('@/lib/offlineQueue').then((m) => m.processQueue().catch(() => {})).catch(() => {});
        }
      } catch {}
    };
    const id = setInterval(update, 10000);
    update();
    return () => {
      mounted = false;
      clearInterval(id);
    };
  } catch {
    useUIStore.getState().setOnline(true);
    return null;
  }
}

export default startNetworkMonitoring;
