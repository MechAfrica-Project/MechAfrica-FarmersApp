import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotificationStore } from "@/stores/notificationStore";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import HeaderBar from "./components/HeaderBar";
import FilterChips from "./components/FilterChips";
import UnreadBadge from "./components/UnreadBadge";
import NotificationCard from "./components/NotificationCard";

const Notifications = () => {
  const { items, filter, setFilter, markAllRead, markRead, deleteNotification, unreadCount } =
    useNotificationStore();

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      {/* Abstract Background Elements for Premium Feel */}
      <View className="absolute top-[-100] left-[-100] w-64 h-64 bg-green-400/20 rounded-full blur-3xl opacity-60" />
      <View className="absolute top-[30%] right-[-50] w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl opacity-50" />
      <View className="absolute bottom-[-50] left-[20%] w-72 h-72 bg-green-500/10 rounded-full blur-3xl opacity-40" />

      <Animated.FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ 
          paddingTop: insets.top + 150, 
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 16 
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <NotificationCard
              item={item}
              onMarkRead={markRead}
              onRemove={deleteNotification}
            />
          </Animated.View>
        )}
      />

      <BlurView
        intensity={80}
        tint="light"
        style={[
          StyleSheet.absoluteFill,
          { height: insets.top + 140, zIndex: 10, paddingHorizontal: 16, paddingTop: insets.top },
        ]}
      >
        <HeaderBar title="Notifications" onMarkAllRead={markAllRead} />
        <FilterChips active={filter} onChange={setFilter} />
        <UnreadBadge count={unreadCount} />
      </BlurView>
    </View>
  );
};

export default Notifications;
