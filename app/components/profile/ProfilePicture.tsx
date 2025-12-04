import { uploadFile } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useFarmerStore } from "@/stores/farmerStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { toastError, toastSuccess } from "@/lib/toast";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const ProfilePicture = () => {
  const { profile, updateProfile } = useFarmerStore();
  const { data, updateData } = useOnboardingStore();
  const profileAny = profile as any;
  const [uploading, setUploading] = useState(false);

  // Note: We no longer call loadFromStorage() here.
  // Profile data is fetched via fetchProfile() which syncs to both farmerStore and onboardingStore.
  // Calling loadFromStorage was causing stale SecureStore data to overwrite fresh backend data.

  // Debug logging to see what data is available
  useEffect(() => {
    if (__DEV__) {
      console.debug("ProfilePicture - profile from farmerStore:", JSON.stringify(profile?.personalInfo, null, 2));
      console.debug("ProfilePicture - data from onboardingStore:", JSON.stringify(data.personalInfo, null, 2));
    }
  }, [profile, data]);

  /**
   * Upload profile picture to backend and update stores with the returned URL.
   *
   * Flow:
   * 1. Pick image from gallery
   * 2. Upload to /uploads/profile-picture endpoint
   * 3. Get the Supabase URL from response
   * 4. Update profile with the URL (not local file path)
   */
  const pickAndUploadImage = async () => {
    try {
      // Step 1: Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1], // Square crop for profile picture
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const localUri = result.assets[0].uri;

      // Show the local image immediately for better UX while uploading
      updateData({ profilePicture: localUri });
      useFarmerStore.setState((state) => ({
        profile: state.profile
          ? { ...state.profile, profilePicture: localUri }
          : state.profile,
      }));

      setUploading(true);

      // Step 2: Upload to backend
      if (__DEV__) {
        console.debug("Uploading profile picture:", localUri);
      }

      const uploadResult = await uploadFile(
        `${API_ENDPOINTS.UPLOADS}/profile-picture`,
        {
          uri: localUri,
          name: `profile-${Date.now()}.jpg`,
          type: "image/jpeg",
        }
      );

      if (__DEV__) {
        console.debug("Profile picture upload result:", uploadResult);
      }

      // Step 3: Get the URL from response
      const uploadedUrl = uploadResult?.url ?? uploadResult?.location;

      if (!uploadedUrl) {
        throw new Error("No URL returned from upload");
      }

      // Step 4: Update profile with the Supabase URL
      // Update local stores immediately
      updateData({ profilePicture: uploadedUrl });
      useFarmerStore.setState((state) => ({
        profile: state.profile
          ? { ...state.profile, profilePicture: uploadedUrl }
          : state.profile,
      }));

      // Also update the backend profile with the new URL
      try {
        await updateProfile({ profilePicture: uploadedUrl });
        toastSuccess("Photo updated", "Your profile picture has been saved.");
      } catch (profileErr) {
        // The image is uploaded, but profile update failed
        // The URL is still valid, so keep it locally
        console.warn("Profile update failed, but image was uploaded:", profileErr);
        toastSuccess("Photo uploaded", "Profile picture uploaded successfully.");
      }

    } catch (err: any) {
      console.error("Failed to upload profile picture:", err);

      // Revert to previous picture on error
      const previousUri = profile?.profilePicture || profileAny?.profilePictureUrl || data.profilePicture;
      if (previousUri) {
        updateData({ profilePicture: previousUri });
        useFarmerStore.setState((state) => ({
          profile: state.profile
            ? { ...state.profile, profilePicture: previousUri }
            : state.profile,
        }));
      }

      // Show appropriate error message
      if (err?.message?.includes("INVALID_PROFILE_PICTURE")) {
        toastError("Upload failed", "Invalid image format. Please try a different photo.");
      } else if (err?.status === 413) {
        toastError("Upload failed", "Image is too large. Please choose a smaller photo.");
      } else {
        toastError("Upload failed", "Could not upload your photo. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  // Responsive sizing
  const imageSize = width * 0.35; // 35% of screen width
  const marginTop = width * 0.1; // dynamic top spacing

  const profilePictureUri =
    profile?.profilePicture ||
    profileAny?.profilePictureUrl ||
    data.profilePicture;

  // Get display name with fallbacks
  const displayName =
    profile?.personalInfo?.firstName ??
    data.personalInfo?.firstName ??
    (profile?.personalInfo as any)?.name?.split?.(" ")?.[0] ??
    (data.personalInfo as any)?.name?.split?.(" ")?.[0] ??
    "Farmer";

  const lastName =
    profile?.personalInfo?.lastName ??
    data.personalInfo?.lastName ??
    (profile?.personalInfo as any)?.name?.split?.(" ")?.slice?.(1)?.join?.(" ") ??
    (data.personalInfo as any)?.name?.split?.(" ")?.slice?.(1)?.join?.(" ") ??
    "";

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
            opacity: uploading ? 0.6 : 1,
          }}
          resizeMode="cover"
        />

        {/* Upload indicator overlay */}
        {uploading && (
          <View
            style={{
              position: "absolute",
              top: 48, // account for mt-12
              left: 0,
              right: 0,
              bottom: 0,
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Edit button */}
        <TouchableOpacity
          onPress={pickAndUploadImage}
          disabled={uploading}
          style={{
            position: "absolute",
            bottom: 6,
            right: 6,
            backgroundColor: uploading ? "#999" : "#00B179",
            padding: Platform.OS === "ios" ? 7 : 6,
            borderRadius: 9999,
          }}
        >
          <Ionicons name="pencil" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text className="mt-3 text-base md:text-lg font-mulish font-bold text-center">
        {displayName} {otherNames} {lastName}
      </Text>
      <Text className="text-gray-500 font-mulish text-xs md:text-sm text-center">
        ID: {phoneLabel}
      </Text>
    </View>
  );
};

export default ProfilePicture;
