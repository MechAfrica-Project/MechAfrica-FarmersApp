import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trash2, Check } from "lucide-react-native";
import { 
  UserNotification, 
  isNotificationRead, 
  formatNotificationTime, 
  getNotificationTypeLabel, 
  getNotificationTypeBadgeClass 
} from "@/types/notification";

type Props = {
  item: UserNotification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
};

const NotificationCard: React.FC<Props> = ({ item, onMarkRead, onRemove }) => {
  const isRead = isNotificationRead(item);
  
  const containerClass = useMemo(
    () =>
      `p-4 rounded-2xl border ${
        isRead ? "border-gray-200 bg-white" : "border-green-200 bg-green-50"
      } shadow-sm`,
    [isRead]
  );

  return (
    <View className={containerClass}>
      <View className="flex-row justify-between items-start">
        <Text className="text-base font-bold text-green-900 flex-1 pr-2">
          {item.title}
        </Text>
        <Text className="text-gray-500 text-xs">
          {item.created_at ? formatNotificationTime(item.created_at) : "Just now"}
        </Text>
      </View>

      <Text className="text-gray-700 mt-1">{item.message}</Text>

      <View className="flex-row justify-between items-center mt-3">
        <View
          className={`px-2 py-1 rounded-full ${getNotificationTypeBadgeClass(item.type)}`}
        >
          <Text className="text-xs font-semibold capitalize">
            {getNotificationTypeLabel(item.type)}
          </Text>
        </View>

        <View className="flex-row gap-2">
          {!isRead && (
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
