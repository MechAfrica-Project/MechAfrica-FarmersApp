import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trash2, Check } from "lucide-react-native";
import { NotificationItem } from "@/stores/notificationStore";

const typeBadgeStyles: Record<NotificationItem["type"], string> = {
  request: "bg-green-100 text-green-800",
  system: "bg-gray-100 text-gray-800",
};

type Props = {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
};

const NotificationCard: React.FC<Props> = ({ item, onMarkRead, onRemove }) => {
  const containerClass = useMemo(
    () =>
      `p-4 rounded-2xl border ${
        item.read ? "border-gray-200 bg-white" : "border-green-200 bg-green-50"
      } shadow-sm`,
    [item.read]
  );

  return (
    <View className={containerClass}>
      <View className="flex-row justify-between items-start">
        <Text className="text-base font-bold text-green-900 flex-1 pr-2">
          {item.title}
        </Text>
        <Text className="text-gray-500 text-xs">{item.time}</Text>
      </View>

      <Text className="text-gray-700 mt-1">{item.body}</Text>

      <View className="flex-row justify-between items-center mt-3">
        <View
          className={`px-2 py-1 rounded-full ${typeBadgeStyles[item.type]}`}
        >
          <Text className="text-xs font-semibold capitalize">{item.type}</Text>
        </View>

        <View className="flex-row gap-2">
          {!item.read && (
            <TouchableOpacity
              onPress={() => onMarkRead(item.id)}
              className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-gray-100"
              activeOpacity={0.8}
            >
              <Check size={14} color="#166534" />
              <Text className="text-gray-700 text-sm font-semibold">Read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            className="flex-row items-center px-3 py-1 rounded-full bg-red-50"
            activeOpacity={0.8}
          >
            <Trash2 size={16} color="#b91c1c" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default NotificationCard;
