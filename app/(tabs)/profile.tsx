import React from "react";
import { View, Text } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import PrimaryButton from "@/app/components/general/PrimaryButton";

const Profile = () => {
  const { logout, phone } = useAuthStore();

  return (
    <View className="flex-1 justify-center align-middle p-22">
      <Text className="text-24 font-semibold mb-16">
        Welcome {phone || "Farmer"} 👋
      </Text>

      <PrimaryButton
        title="Logout"
        onPress={logout}
        textClassName="text-white"
      />
    </View>
  );
};

export default Profile;
