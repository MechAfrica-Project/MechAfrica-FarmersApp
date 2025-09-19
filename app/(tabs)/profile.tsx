// app/profile.tsx (or pages/Profile.tsx)
import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import MenuList from "../components/profile/MenuList";
import ProfilePicture from "../components/profile/ProfilePicture";

const Profile = () => {
  return (
    <MultiToneBackground topColor="#FFF9D6" topHeight={140} mainColor="#FFFFFF">
      {/* Profile Picture */}
      <ProfilePicture />

      {/* Menu List */}
      <MenuList />
    </MultiToneBackground>
  );
};

export default Profile;