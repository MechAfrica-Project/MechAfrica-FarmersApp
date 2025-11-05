import { create } from "zustand";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "request" | "system" | "payment";
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
};

// 🧑🏾‍🌾 Notifications tailored for a FARMER user
const seed: NotificationItem[] = [
  {
    id: "n1",
    title: "Request accepted",
    body: "Your Harvesting request in Ejisu Adadientem has been accepted by ServicePro.",
    time: "5m ago",
    type: "request",
    read: false,
  },
  {
    id: "n2",
    title: "Service in progress",
    body: "ServicePro has started your Ploughing request in New Tafo.",
    time: "30m ago",
    type: "request",
    read: false,
  },
  {
    id: "n3",
    title: "Payment processed",
    body: "₵850.00 has been deducted for your completed Ripping service at Adenta Block A.",
    time: "2h ago",
    type: "payment",
    read: false,
  },
  {
    id: "n4",
    title: "Request completed",
    body: "Your Harrowing request at Fumesua has been marked as completed.",
    time: "Yesterday",
    type: "request",
    read: true,
  },
  {
    id: "n5",
    title: "System update",
    body: "We’ve added new tractor services available in your district.",
    time: "2 days ago",
    type: "system",
    read: true,
  },
  {
    id: "n6",
    title: "Request cancelled",
    body: "Your Ripping request in Mamponteng was cancelled by the operator.",
    time: "3 days ago",
    type: "request",
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: seed,
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
}));
