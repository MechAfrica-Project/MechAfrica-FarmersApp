import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import MultiToneBackground from "../components/general/MultiToneBackground";
import MenuList from "../components/profile/MenuList";
import ProfilePicture from "../components/profile/ProfilePicture";
import { getAuthToken } from "@/lib/api";
import { useFarmerStore } from "@/stores/farmerStore";

const Profile = () => {
  const fetchProfile = useFarmerStore((state) => state.fetchProfile);

  useEffect(() => {
    const token = typeof getAuthToken === "function" ? getAuthToken() : null;
    if (token) {
      fetchProfile();
    }
  }, [fetchProfile]);

  return (
    <MultiToneBackground topColor="#FFF9D6" topHeight={140} mainColor="#FFFFFF">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingBottom: 40,
        }}
      >
        <ProfilePicture />
        <MenuList />
      </ScrollView>
    </MultiToneBackground>
  );
};

export default Profile;
