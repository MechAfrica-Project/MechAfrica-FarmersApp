import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import React from "react";
import { Image, View } from "react-native";

const NotificationBar = () => {
  return (
    <View className="mt-[3rem] flex-row justify-between items-center px-2 pr-7">
      <Image source={icons.mechIcon} />
      {/* Link to the top-level notifications route exposed at `/notifications` */}
      <Link href="/notifications">
        <Image source={icons.notification} />
      </Link>
    </View>
  );
};

export default NotificationBar;
