// steps/ProfilePictureStep.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Ionicons } from "@expo/vector-icons";

export default function ProfilePictureStep() {
  const { data, updateData } = useOnboardingStore();

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
    <View className="flex-1 items-center justify-center px-5">

      {/* Glow wrapper */}
      <View className="w-[18rem] h-[18rem] rounded-full mt-10 bg-yellow-100/40 items-center justify-center mb-6">
        {/* Circular Upload Area */}
        <TouchableOpacity
          onPress={pickImage}
          className="w-[17rem] h-[17rem] rounded-full border-[0.7rem] border-white bg-gray-100 items-center justify-center"
        >
          {data.profilePicture ? (
            <Image
              source={{ uri: data.profilePicture }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <Ionicons name="image-outline" size={48} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      {/* Buttons Row */}
      <View className="flex-row gap-5 mt-4">
        <TouchableOpacity
          onPress={pickImage}
          className="w-12 h-12 rounded-xl bg-black items-center justify-center"
        >
          <Ionicons name="camera-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          className="px-5 py-3 rounded-lg border bg-white"
        >
          <Text className="text-sm font-semibold text-black">
            Upload Picture
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
