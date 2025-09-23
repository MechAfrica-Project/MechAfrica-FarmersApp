import { Image, View } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { Link } from "expo-router";

const NotificationBar = () => {  
  return (
    <View className="mt-[3rem] flex-row justify-between items-center px-2 pr-7">
      <Image source={icons.mechIcon} />
      <Link href="/components/notifications/notifications">
        <Image source={icons.notification} />
      </Link>
    </View>
  );
};

export default NotificationBar;
