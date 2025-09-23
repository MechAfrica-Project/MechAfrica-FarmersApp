import { Image, TouchableOpacity, View } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";

const NotificationBar = () => {
  return (
    <View className="mt-[3rem] flex-row justify-between items-center px-2 pr-7">
      <Image source={icons.mechIcon} />
      <TouchableOpacity>
        <Image source={icons.notification} />
      </TouchableOpacity>
    </View>
  );
};

export default NotificationBar;
