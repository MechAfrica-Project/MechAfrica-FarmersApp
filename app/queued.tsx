import { clearQueue, getQueue, processQueue, removeFromQueue, retryQueueItem } from "@/lib/offlineQueue";
import { toastError, toastInfo, toastSuccess } from '@/lib/toast';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

export default function QueuedScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [globalBusy, setGlobalBusy] = useState(false);

  async function refresh() {
    const q = await getQueue();
    setItems(q || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  const retryOne = async (it: any) => {
    setBusyIds((s) => ({ ...s, [it.id]: true }));
    try {
      const res = await retryQueueItem(it.id);
      if ((res as any)?.ok) {
        try { toastSuccess("Queued item sent", `${it.method} ${it.endpoint}`); } catch {}
      } else {
        const msg = (res as any)?.status ? `Status ${ (res as any).status }` : (res as any)?.error ?? "Failed";
        try { toastError("Retry failed", msg); } catch {}
      }
    } catch {
      try { toastError("Retry failed", "Unexpected error"); } catch {}
    } finally {
      await refresh();
      setBusyIds((s) => {
        const copy = { ...s };
        delete copy[it.id];
        return copy;
      });
    }
  };

  const retryAll = async () => {
    setGlobalBusy(true);
    try {
      await processQueue();
      try { toastSuccess("Processing queued items"); } catch {}
    } catch {
      try { toastError("Processing failed"); } catch {}
    } finally {
      await refresh();
      setGlobalBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 40, backgroundColor: "#f9fafb" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Queued Items</Text>
        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={retryAll} style={{ marginRight: 8, backgroundColor: "#10B981", padding: 8, borderRadius: 8 }}>
            {globalBusy ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: "white" }}>Processing...</Text>
              </View>
            ) : (
              <Text style={{ color: "white" }}>Retry All</Text>
            )}
          </Pressable>
          <Pressable onPress={async () => { await clearQueue(); await refresh(); try { toastInfo("Queue cleared"); } catch {} }} style={{ backgroundColor: "#EF4444", padding: 8, borderRadius: 8 }}>
            <Text style={{ color: "white" }}>Clear All</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView>
        {items.length === 0 && (
          <Text style={{ color: "#6b7280" }}>No queued items</Text>
        )}

        {items.map((it) => (
          <View key={it.id} style={{ backgroundColor: "white", padding: 12, borderRadius: 8, marginBottom: 10 }}>
            <Text style={{ fontWeight: "700" }}>{it.method} {it.endpoint}</Text>
            <Text style={{ color: "#6b7280", marginTop: 6 }}>{JSON.stringify(it.body || {})}</Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Pressable
                onPress={async () => retryOne(it)}
                style={{ marginRight: 8, backgroundColor: "#3B82F6", padding: 8, borderRadius: 8 }}
              >
                {busyIds[it.id] ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: "white" }}>Working...</Text>
                  </View>
                ) : (
                  <Text style={{ color: "white" }}>Retry</Text>
                )}
              </Pressable>
              <Pressable onPress={async () => { await removeFromQueue(it.id); await refresh(); try { toastInfo("Removed from queue"); } catch {} }} style={{ backgroundColor: "#F97316", padding: 8, borderRadius: 8 }}>
                <Text style={{ color: "white" }}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
