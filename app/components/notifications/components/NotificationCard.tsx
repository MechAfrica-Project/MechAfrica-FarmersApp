import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NotificationItem } from "@/stores/notificationStore";

const typeBadgeStyles: Record<NotificationItem["type"], string> = {
  request: "bg-green-100 text-green-800",
  system: "bg-gray-100 text-gray-800",
  payment: "bg-yellow-100 text-yellow-800",
};

type Props = {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
};

const NotificationCard: React.FC<Props> = ({ item, onMarkRead, onRemove }) => {
  const containerClass = useMemo(
    () => `p-4 rounded-2xl border ${item.read ? "border-gray-200 bg-white" : "border-green-200 bg-green-50"}`,
    [item.read]
  );

  return (
    <View className={containerClass}>
      <View className="flex-row justify-between items-start">
        <Text className={`text-base font-extrabold ${item.read ? "text-green-900" : "text-green-900"}`}>{item.title}</Text>
        <Text className="text-gray-500 text-xs">{item.time}</Text>
      </View>
      <Text className="text-gray-700 mt-1">{item.body}</Text>
      <View className="flex-row justify-between items-center mt-3">
        <View className={`px-2 py-1 rounded-full ${typeBadgeStyles[item.type]}`}>
          <Text className="text-xs font-semibold capitalize">{item.type}</Text>
        </View>
        <View className="flex-row gap-2">
          {!item.read && (
            <TouchableOpacity onPress={() => onMarkRead(item.id)} className="px-3 py-1 rounded-full bg-gray-100">
              <Text className="text-gray-700 text-sm font-semibold">Mark read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onRemove(item.id)} className="px-3 py-1 rounded-full bg-red-50">
            <Text className="text-red-700 text-sm font-semibold">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default NotificationCard;


