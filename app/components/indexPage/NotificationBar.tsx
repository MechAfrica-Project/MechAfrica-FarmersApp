import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import React from "react";
import { Image, View, TouchableOpacity, Text } from "react-native";
import { useNotificationStore } from "@/stores/notificationStore";

const NotificationBar = () => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <View className="mt-[3rem] flex-row justify-between items-center px-2 pr-7">
      <Image source={icons.mechIcon} />
      {/* Link to the top-level notifications route exposed at `/notifications` */}
      <Link href="/notifications" asChild>
        <TouchableOpacity className="relative p-1">
          <Image source={icons.notification} />
          {unreadCount > 0 && (
            <View className="absolute top-0 right-0 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center px-1 border border-white">
              <Text className="text-white text-[9px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default NotificationBar;
