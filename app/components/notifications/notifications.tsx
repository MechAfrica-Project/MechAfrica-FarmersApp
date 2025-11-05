import React, { useMemo } from 'react'
import { View, FlatList } from 'react-native'
import { useNotificationStore } from '@/stores/notificationStore'
import HeaderBar from './components/HeaderBar'
import FilterChips from './components/FilterChips'
import UnreadBadge from './components/UnreadBadge'
import NotificationCard from './components/NotificationCard'

const Notifications = () => {
  const { items, filter, setFilter, markAllRead, markRead, remove } = useNotificationStore()

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((n) => n.type === filter)
  }, [items, filter])

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items])

  return (
    <View className="flex-1 bg-white pt-[4.5rem] px-4">
      <HeaderBar title="Notifications" onMarkAllRead={markAllRead} />
      <FilterChips active={filter as any} onChange={setFilter as any} />
      <UnreadBadge count={unreadCount} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <NotificationCard item={item} onMarkRead={markRead} onRemove={remove} />
        )}
      />
    </View>
  )
}

export default Notifications