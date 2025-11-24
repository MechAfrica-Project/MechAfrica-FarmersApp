import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getQueue } from "@/lib/offlineQueue";
import { useUIStore } from "@/stores/uiStore";

export default function OfflineQueueIndicator() {
  const online = useUIStore((s) => s.online);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    let t: ReturnType<typeof setInterval> | null = null;

    async function refresh() {
      try {
        const q = await getQueue();
        if (!mounted) return;
        setCount(q.length);
      } catch {}
    }

    refresh();
    t = setInterval(refresh, 3000);

    return () => {
      mounted = false;
      if (t) clearInterval(t);
    };
  }, []);

  if (online && count === 0) return null;

  return (
    <View style={[styles.container, online ? styles.online : styles.offline]}>
      <Text style={styles.text}>{online ? `Syncing ${count} queued` : `Offline • ${count} queued`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 9999,
  },
  offline: {
    backgroundColor: "#C53030",
  },
  online: {
    backgroundColor: "#2F855A",
  },
  text: {
    color: "#fff",
    fontSize: 13,
  },
});
