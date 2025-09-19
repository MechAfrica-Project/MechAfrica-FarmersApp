import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "@/stores/onboardingStore";
import * as ImagePicker from "expo-image-picker";

const ProfilePicture = () => {
  const { data, loadFromStorage, updateData } = useOnboardingStore();

  useEffect(() => {
    loadFromStorage();
  }, []);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      updateData({ profilePicture: result.assets[0].uri });
    }
  };
  return (
    <View className="items-center mt-[5rem]">
      {/* Profile Image with Edit Icon */}
      <View className="relative">
        <Image
          source={{ uri: data.profilePicture }}
          className="w-[10rem] h-[10rem] rounded-full border-4 border-gray-color/20"
        />
        <TouchableOpacity
          onPress={pickImage}
          className="absolute bottom-1 right-1 bg-primary-green p-2 rounded-full"
        >
          <Ionicons name="pencil" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Name & ID */}
      <Text className="mt-3 text-lg font-mulish font-bold">
        {data.personalInfo.name}
        {data.personalInfo.otherNames || "N/A"}
      </Text>
      <Text className="text-gray-500 font-mulish text-xs">
        ID: {data.personalInfo.phone?.raw || "N/A"}
      </Text>
    </View>
  );
};

export default ProfilePicture;
