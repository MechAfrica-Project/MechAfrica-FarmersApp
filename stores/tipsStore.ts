// stores/tipsStore.ts
import { apiFetch, getAuthToken } from "@/lib/api";
import { API_ENDPOINTS, endpoints } from "@/lib/apiEndpoints";
import { create } from "zustand";

export type Tip = {
  id: string;
  title: string;
  content: string;
  category?: string;
  priority?: "high" | "medium" | "low";
  viewed?: boolean;
  actionTaken?: boolean;
  createdAt?: string;
  expiresAt?: string;
};

interface TipsState {
  tips: Tip[];
  currentTip: Tip | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchTips: () => Promise<void>;
  refreshTips: () => Promise<void>;
  fetchTipsByCategory: (category: string) => Promise<void>;
  markTipAsViewed: (tipId: string) => Promise<void>;
  markTipActionTaken: (tipId: string) => Promise<void>;
  submitTipFeedback: (tipId: string, feedback: string) => Promise<void>;
  rateTip: (tipId: string, rating: number) => Promise<void>;
  shareTip: (tipId: string) => Promise<void>;
  getRandomTip: () => Tip | null;
}

export const useTipsStore = create<TipsState>((set, get) => ({
  tips: [],
  currentTip: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchTips: async () => {
    // Check if we have a valid auth token
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) {
      if (__DEV__) {
        console.debug("fetchTips skipped: no auth token");
      }
      return;
    }

    set({ loading: true, error: null });

    try {
      const data = await apiFetch<{ tips: Tip[] } | Tip[]>(API_ENDPOINTS.FARMER_TIPS);

      // Handle both response formats: { tips: [...] } or [...]
      const tips = Array.isArray(data) ? data : data.tips || [];

      set({
        tips,
        currentTip: tips.length > 0 ? tips[0] : null,
        loading: false,
        lastFetched: Date.now(),
      });

      if (__DEV__) {
        console.debug("Fetched tips:", tips.length);
      }
    } catch (err: any) {
      console.error("Failed to fetch tips:", err);
      set({
        error: err?.message || "Failed to fetch tips",
        loading: false,
      });
    }
  },

  refreshTips: async () => {
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    set({ loading: true, error: null });

    try {
      const data = await apiFetch<{ tips: Tip[] } | Tip[]>(
        API_ENDPOINTS.FARMER_TIPS_REFRESH,
        { method: "POST" }
      );

      const tips = Array.isArray(data) ? data : data.tips || [];

      set({
        tips,
        currentTip: tips.length > 0 ? tips[0] : null,
        loading: false,
        lastFetched: Date.now(),
      });

      if (__DEV__) {
        console.debug("Refreshed tips:", tips.length);
      }
    } catch (err: any) {
      console.error("Failed to refresh tips:", err);
      set({
        error: err?.message || "Failed to refresh tips",
        loading: false,
      });
    }
  },

  fetchTipsByCategory: async (category: string) => {
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    set({ loading: true, error: null });

    try {
      const data = await apiFetch<{ tips: Tip[] } | Tip[]>(endpoints.tipsByCategory(category));

      const tips = Array.isArray(data) ? data : data.tips || [];

      set({
        tips,
        currentTip: tips.length > 0 ? tips[0] : null,
        loading: false,
      });
    } catch (err: any) {
      console.error(`Failed to fetch tips for category ${category}:`, err);
      set({
        error: err?.message || "Failed to fetch tips by category",
        loading: false,
      });
    }
  },

  markTipAsViewed: async (tipId: string) => {
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    try {
      await apiFetch(endpoints.tipView(tipId), { method: "POST", suppressToast: true } as RequestInit);

      // Update local state
      set((state) => ({
        tips: state.tips.map((tip) =>
          tip.id === tipId ? { ...tip, viewed: true } : tip
        ),
      }));
    } catch (err: any) {
      if (__DEV__) {
        console.warn(`Failed to mark tip as viewed [${err?.status || 'Unknown'}]: ${err?.message || err}`);
      }
    }
  },

  markTipActionTaken: async (tipId: string) => {
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    try {
      await apiFetch(endpoints.tipAction(tipId), { method: "POST" });

      // Update local state
      set((state) => ({
        tips: state.tips.map((tip) =>
          tip.id === tipId ? { ...tip, actionTaken: true } : tip
        ),
      }));
    } catch (err: any) {
      console.error("Failed to mark tip action taken:", err);
    }
  },

  submitTipFeedback: async (tipId: string, feedback: string) => {
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    try {
      await apiFetch(endpoints.tipFeedback(tipId), {
        method: "POST",
        body: JSON.stringify({ feedback }),
      });

      if (__DEV__) {
        console.debug("Tip feedback submitted:", tipId);
      }
    } catch (err: any) {
      console.error("Failed to submit tip feedback:", err);
    }
  },

  rateTip: async (tipId: string, rating: number) => {
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    try {
      await apiFetch(endpoints.tipRate(tipId), {
        method: "POST",
        body: JSON.stringify({ rating }),
      });

      if (__DEV__) {
        console.debug("Tip rated:", tipId, rating);
      }
    } catch (err: any) {
      console.error("Failed to rate tip:", err);
    }
  },

  shareTip: async (tipId: string) => {
    const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    try {
      await apiFetch(endpoints.tipShare(tipId), { method: "POST" });

      if (__DEV__) {
        console.debug("Tip share recorded:", tipId);
      }
    } catch (err: any) {
      console.error("Failed to record tip share:", err);
    }
  },

  getRandomTip: () => {
    const { tips } = get();
    if (tips.length === 0) return null;

    // Prioritize unviewed tips
    const unviewedTips = tips.filter((tip) => !tip.viewed);
    const tipsToChooseFrom = unviewedTips.length > 0 ? unviewedTips : tips;

    const randomIndex = Math.floor(Math.random() * tipsToChooseFrom.length);
    return tipsToChooseFrom[randomIndex];
  },
}));
