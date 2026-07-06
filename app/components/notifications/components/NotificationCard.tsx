import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Animated, Pressable } from "react-native";
import { Trash2, Check, ChevronRight } from "lucide-react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
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
  const formattedTime = item.created_at ? formatNotificationTime(item.created_at) : "Just now";
  const isActionable = !isRead;

  const containerClass = useMemo(
    () =>
      `rounded-2xl border overflow-hidden my-2 mx-4 ${isRead
        ? "border-white/60 bg-white/40"
        : "border-green-200/60 bg-green-50/60"
      }`,
    [isRead]
  );

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
    return (
      <TouchableOpacity 
        onPress={() => onRemove(item.id)}
        className="bg-red-500 justify-center items-end rounded-2xl my-2 px-6 shadow-sm"
        style={{ width: 100 }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (progress: any, dragX: any) => {
    if (isRead) return null;
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
    return (
      <TouchableOpacity 
        onPress={() => onMarkRead?.(item.id)}
        className="bg-green-600 justify-center items-start rounded-2xl my-2 px-6 shadow-sm"
        style={{ width: 100 }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Check size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
      onSwipeableOpen={(direction) => {
        if (direction === "left") {
          if (!isRead) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onMarkRead?.(item.id);
          }
        } else if (direction === "right") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onRemove?.(item.id);
        }
      }}
    >
      <Pressable
        className={containerClass}
        onPress={() => {
          if (!isRead) {
            onMarkRead?.(item.id);
          }
          if (item.action_url) {
            router.push(item.action_url as any);
          } else if (item.metadata?.request_id) {
            router.push(`/(tabs)/requests?openRequestId=${item.metadata.request_id}` as any);
          }
        }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <BlurView intensity={isRead ? 40 : 60} tint="light" className="p-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-2">
              <Text
                className={`text-base font-extrabold font-mulish ${isRead ? "text-gray-700" : "text-green-900"
                  }`}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-xs font-mulish">{formattedTime}</Text>
              {isActionable && (
                <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 4 }} />
              )}
            </View>
          </View>

          <Text className={`mt-1 font-mulish ${isRead ? "text-gray-600" : "text-gray-700"}`} numberOfLines={3}>
            {item.message}
          </Text>

          <View className="flex-row justify-between items-center mt-4">
            <View className={`px-2.5 py-1 rounded-md ${getNotificationTypeBadgeClass(item.type)}`}>
              <Text className="text-xs font-bold uppercase tracking-widest font-mulish">{getNotificationTypeLabel(item.type)}</Text>
            </View>

            {!isRead && (
              <View className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
            )}
          </View>
        </BlurView>
      </Pressable>
    </Swipeable>
  );
};

export default NotificationCard;
