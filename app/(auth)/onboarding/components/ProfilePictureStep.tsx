import { uploadFile } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toastError } from '@/lib/toast';
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

export default function ProfilePictureStep() {
  const { data, updateData } = useOnboardingStore();
  const [uploading, setUploading] = useState(false);
  const screenWidth = Dimensions.get("window").width;

  // 📸 Take a new photo using the camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      try { toastError('Permission denied', 'Camera permission is required to take photos.'); } catch {}
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"], // ✅ updated syntax
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      // Optimistically set local URI so UI updates immediately
      updateData({ profilePicture: uri });

      // Try to upload and replace with remote URL when available
      (async () => {
        try {
          setUploading(true);
          const resp: any = await uploadFile(API_ENDPOINTS.UPLOADS, { uri });
          // Expect response like { url: 'https://...' }
          if (resp && (resp.url || resp.location)) {
            updateData({ profilePicture: resp.url ?? resp.location });
          }
        } catch (err) {
          // keep local URI on failure
          console.warn("upload failed", err);
        } finally {
          setUploading(false);
        }
      })();
    }
  };

  // 🖼️ Pick an existing image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      updateData({ profilePicture: result.assets[0].uri });
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-5">
      {/* Glow wrapper */}
      <View
        style={{ width: screenWidth * 0.7, height: screenWidth * 0.7 }}
        className="rounded-full bg-yellow-100/40 items-center justify-center mb-6 mt-10"
      >
        {/* Circular Upload Area */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            width: screenWidth * 0.65,
            height: screenWidth * 0.65,
          }}
          className="rounded-full border-[6px] border-white bg-gray-100 items-center justify-center overflow-hidden"
        >
          {data.profilePicture ? (
            <Image
              source={{ uri: data.profilePicture }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="image-outline" size={48} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      {/* Buttons Row */}
      <View className="flex-row items-center gap-5 mt-4">
        {/* Camera Button */}
        <TouchableOpacity
          onPress={takePhoto}
          className="w-12 h-12 rounded-xl bg-black items-center justify-center"
        >
          <Ionicons name="camera-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={pickImage}
          className="px-5 py-3 rounded-lg border bg-white"
        >
          <Text className="text-sm font-semibold text-black">
            {uploading ? "Uploading..." : "Upload Picture"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
