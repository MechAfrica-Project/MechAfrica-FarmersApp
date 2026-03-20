import React, { useMemo } from "react";
import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotificationStore } from "@/stores/notificationStore";
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

  return (
    <SafeAreaView
      className="flex-1 bg-[#F9FAFB]"
      edges={["top", "left", "right"]}
    >
      <View className="flex-1 px-4">
        <HeaderBar title="Notifications" onMarkAllRead={markAllRead} />
        <FilterChips active={filter} onChange={setFilter} />
        <UnreadBadge count={unreadCount} />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onMarkRead={markRead}
              onRemove={deleteNotification}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Notifications;
