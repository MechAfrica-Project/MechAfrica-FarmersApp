import { create } from "zustand";
import API_ENDPOINTS from "@/lib/apiEndpoints";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "request" | "system";
  read: boolean;
};

type FilterType = "all" | NotificationItem["type"];

type NotificationState = {
  items: NotificationItem[];
  filter: FilterType;

  setFilter: (f: FilterType) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  addMany: (items: NotificationItem[]) => void;
  clear: () => void;
  fetchNotifications: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  filter: "all",

  setFilter: (f) => set({ filter: f }),

  markAllRead: () =>
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),

  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),

  addMany: (list) => set((s) => ({ items: [...list, ...s.items] })),
  clear: () => set({ items: [] }),

  // Fetch notifications from backend (if available). Expected shape: { notifications: NotificationItem[] }
    fetchNotifications: async () => {
      try {
        // lazy import to avoid circular deps in some setups
        const { apiFetch } = await import("@/lib/api");
        // accept either { notifications: [] } or an array directly
        const data: any = await apiFetch(API_ENDPOINTS.NOTIFICATIONS);
        const list = Array.isArray(data) ? data : data?.notifications ?? [];
        if (Array.isArray(list)) set({ items: list });
      } catch (err) {
        console.warn("fetchNotifications failed", err);
      }
    },
}));