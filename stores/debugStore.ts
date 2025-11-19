import { create } from "zustand";

type DebugState = {
  lastRouterState?: any;
  setLastRouterState: (s?: any) => void;
  clear: () => void;
};

export const useDebugStore = create<DebugState>((set) => ({
  lastRouterState: undefined,
  setLastRouterState: (s) => set({ lastRouterState: s }),
  clear: () => set({ lastRouterState: undefined }),
}));

export default useDebugStore;
