import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { getQueue, processQueue, clearQueue, removeFromQueue, retryQueueItem } from "@/lib/offlineQueue";
import Toast from "react-native-toast-message";

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
        Toast.show({ type: "success", text1: "Queued item sent", text2: `${it.method} ${it.endpoint}` });
      } else {
        const msg = (res as any)?.status ? `Status ${ (res as any).status }` : (res as any)?.error ?? "Failed";
        Toast.show({ type: "error", text1: "Retry failed", text2: msg });
      }
    } catch {
      Toast.show({ type: "error", text1: "Retry failed", text2: "Unexpected error" });
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
      Toast.show({ type: "success", text1: "Processing queued items" });
    } catch {
      Toast.show({ type: "error", text1: "Processing failed" });
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
            <Text style={{ color: "white" }}>{globalBusy ? "Processing..." : "Retry All"}</Text>
          </Pressable>
          <Pressable onPress={async () => { await clearQueue(); await refresh(); Toast.show({ type: "info", text1: "Queue cleared" }); }} style={{ backgroundColor: "#EF4444", padding: 8, borderRadius: 8 }}>
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
                <Text style={{ color: "white" }}>{busyIds[it.id] ? "Working..." : "Retry"}</Text>
              </Pressable>
              <Pressable onPress={async () => { await removeFromQueue(it.id); await refresh(); Toast.show({ type: "info", text1: "Removed from queue" }); }} style={{ backgroundColor: "#F97316", padding: 8, borderRadius: 8 }}>
                <Text style={{ color: "white" }}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
