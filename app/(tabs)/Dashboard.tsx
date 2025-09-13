import React from "react";
import { View, Text } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import PrimaryButton from "@/app/components/general/PrimaryButton";

const Dashboard = () => {
  const { logout, phone } = useAuthStore();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 16 }}>
        Welcome {phone || "Farmer"} 👋
      </Text>

      <PrimaryButton title="Logout" onPress={logout} />
    </View>
  );
};

export default Dashboard;
