import React from "react";
import { ScrollView } from "react-native";
import MultiToneBackground from "../components/general/MultiToneBackground";
import MenuList from "../components/profile/MenuList";
import ProfilePicture from "../components/profile/ProfilePicture";

const Profile = () => {
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
