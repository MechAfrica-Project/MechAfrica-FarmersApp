import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useUIStore } from "@/stores/uiStore";

const GlobalLoader = () => {
  const loading = useUIStore((s) => s.loading);

  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default GlobalLoader;
