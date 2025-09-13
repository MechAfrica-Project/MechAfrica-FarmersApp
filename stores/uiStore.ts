import { create } from "zustand";

type UIState = {
  loading: boolean;
  setLoading: (val: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
}));
