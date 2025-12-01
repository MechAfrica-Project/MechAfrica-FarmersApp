import { useFarmerStore } from "@/stores/farmerStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const ProfilePicture = () => {
  const { profile } = useFarmerStore();
  const { data, loadFromStorage, updateData } = useOnboardingStore();
  const profileAny = profile as any;

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      updateData({ profilePicture: uri });
      useFarmerStore.setState((state) => ({
        profile: state.profile
          ? { ...state.profile, profilePicture: uri }
          : state.profile,
      }));
    }
  };

  // Responsive sizing
  const imageSize = width * 0.35; // 35% of screen width
  const marginTop = width * 0.1; // dynamic top spacing

  const profilePictureUri =
    profile?.profilePicture ||
    profileAny?.profilePictureUrl ||
    data.profilePicture;
  const displayName =
    profile?.personalInfo?.name ??
    data.personalInfo?.name ??
    "Farmer";
  const otherNames =
    profile?.personalInfo?.otherNames ?? data.personalInfo?.otherNames ?? "";
  const phoneLabel =
    profile?.personalInfo?.phone?.raw ??
    profileAny?.personalInfo?.phoneNumber ??
    profileAny?.personalInfo?.phone ??
    profileAny?.phone ??
    data.personalInfo?.phone?.raw ??
    "N/A";
  const imageSource = profilePictureUri
    ? { uri: profilePictureUri }
    : { uri: "https://placehold.co/300x300?text=Farmer" };

  return (
    <View style={{ alignItems: "center", marginTop }}>
      <View style={{ position: "relative" }}>
        <Image
          source={imageSource}
          className="mt-12"
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2,
            borderWidth: 4,
            borderColor: "rgba(128,128,128,0.2)",
          }}
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={pickImage}
          style={{
            position: "absolute",
            bottom: 6,
            right: 6,
            backgroundColor: "#00B179",
            padding: Platform.OS === "ios" ? 7 : 6,
            borderRadius: 9999,
          }}
        >
          <Ionicons name="pencil" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text className="mt-3 text-base md:text-lg font-mulish font-bold text-center">
        {displayName} {otherNames}
      </Text>
      <Text className="text-gray-500 font-mulish text-xs md:text-sm text-center">
        ID: {phoneLabel}
      </Text>
    </View>
  );
};

export default ProfilePicture;
