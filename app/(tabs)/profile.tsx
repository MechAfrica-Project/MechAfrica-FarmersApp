import { useEffect } from "react";
import { Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";

export default function Profile() {
  const data = useOnboardingStore((s) => s.data);
  const loadFromStorage = useOnboardingStore((s) => s.loadFromStorage);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const handleLogout = async () => {
    await logout();
    resetOnboarding();
  };

  return (
    <ScrollView className="flex-1 p-4">
      {data.personalInfo?.name ? (
        <View>
          <Text className="text-xl font-bold mb-4">Profile</Text>

          {/* ✅ Profile picture */}
          {data.profilePicture && (
            <Image
              source={{ uri: data.profilePicture }}
              className="w-32 h-32 rounded-full mb-4"
              resizeMode="cover"
            />
          )}

          <Text>Name: {data.personalInfo.name}</Text>
          <Text>Other Names: {data.personalInfo.otherNames}</Text>
          <Text>Phone: {data.personalInfo.phone?.raw}</Text>
          <Text>Gender: {data.moreInfo?.gender}</Text>
          <Text>Age: {data.moreInfo?.age}</Text>
          <Text>Region: {data.location?.region}</Text>
          <Text>District: {data.location?.district}</Text>
          <Text>Farm Name: {data.farmInfo?.farmName}</Text>
          <Text>Farm Size: {data.farmInfo?.farmSize}</Text>
          <Text>Crop Types: {data.farmInfo?.cropTypes?.join(", ")}</Text>

          {/* ✅ Farm Location */}
          {data.farmLocation ? (
            <Text>
              Farm Location: {data.farmLocation.latitude},{" "}
              {data.farmLocation.longitude}
            </Text>
          ) : (
            <Text>Farm Location: Not set</Text>
          )}

          {/* ✅ Logout button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-6 bg-red-500 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>No profile data found.</Text>
      )}
    </ScrollView>
  );
}
