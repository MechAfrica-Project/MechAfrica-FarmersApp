import useDebugStore from "@/stores/debugStore";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const RouterStateOverlay: React.FC = () => {
  const state = useDebugStore((s) => s.lastRouterState);
  const clear = useDebugStore((s) => s.clear);

  if (!state) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 40,
        right: 12,
        left: 12,
        maxHeight: 300,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 8,
        padding: 8,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "700", marginBottom: 6 }}>Router state (debug)</Text>
        <TouchableOpacity onPress={clear}>
          <Text style={{ color: "#fff", opacity: 0.8 }}>Close</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled>
        <Text style={{ color: "#fff", fontFamily: "monospace", fontSize: 12 }}>
          {JSON.stringify(state, null, 2)}
        </Text>
      </ScrollView>
    </View>
  );
};

export default RouterStateOverlay;
