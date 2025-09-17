import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useFarmerStore } from "@/stores/farmerStore";
import PrimaryButton from "@/app/components/general/PrimaryButton";

const Profile = () => {
  const { phone, logout } = useAuthStore();
  const { profile, fetchProfile, loading, error } = useFarmerStore();

  // 🔄 Fetch farmer profile when screen mounts
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <View className="flex-1 justify-center items-center p-6">
      {loading && <ActivityIndicator size="large" color="#16a34a" />}
      {error && <Text className="text-red-500 font-mulish mb-4">{error}</Text>}

      {!loading && !error && (
        <>
          <Text className="text-2xl font-semibold mb-2">
            Welcome {profile?.name || phone?.formatted || "Farmer"} 👋
          </Text>

          <View className="mt-4 space-y-2">
            <Text className="text-gray-600 font-mulish">
              📱 Phone: {phone?.formatted || phone?.raw || "N/A"}
            </Text>
            <Text className="text-gray-600 font-mulish">
              📧 Email: {profile?.email || "N/A"}
            </Text>
            <Text className="text-gray-600 font-mulish">
              🏠 Location: {profile?.location || "N/A"}
            </Text>
          </View>

          <PrimaryButton
            title="Logout"
            onPress={logout}
            textClassName="text-white mt-6"
          />
        </>
      )}
    </View>
  );
};

export default Profile;
