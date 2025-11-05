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

const seed: NotificationItem[] = [
  {
    id: "n1",
    title: "New demand request",
    body: "Farmer Kofi requested Harvesting in Ejisu Adadientem.",
    time: "2m ago",
    type: "request",
    read: false,
  },
  {
    id: "n2",
    title: "Payment received",
    body: "₵850.00 from Completed: Ripping - Adenta Block A.",
    time: "1h ago",
    type: "payment",
    read: false,
  },
  {
    id: "n3",
    title: "System update",
    body: "Market analysis data refreshed for your district.",
    time: "Yesterday",
    type: "system",
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: seed,
  filter: "all",

  setFilter: (f) => set({ filter: f }),

  markAllRead: () => set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),

  markRead: (id) =>
    set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

  remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),

  addMany: (list) => set((s) => ({ items: [...list, ...s.items] })),

  clear: () => set({ items: [] }),
}));


