// steps/ProfilePictureStep.tsx
import React from "react";
import { View, Text, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useOnboardingStore } from "@/stores/onboardingStore";

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
    <View style={{ flex: 1, padding: 16, alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Upload Profile Picture</Text>

      {data.profilePicture ? (
        <Image source={{ uri: data.profilePicture }} style={{ width: 128, height: 128, borderRadius: 64, marginBottom: 12 }} />
      ) : null}

      <Button title="Choose Image" onPress={pickImage} />
    </View>
  );
}
