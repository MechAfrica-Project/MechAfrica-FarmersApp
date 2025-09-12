// stores/farmerStore.ts
import { create } from "zustand";
import { apiFetch } from "@/lib/api";

interface FarmerState {
  profile: any;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
}

export const useFarmerStore = create<FarmerState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      // 🔐 token auto-attached by apiFetch (stubbed or real)
      const data = await apiFetch<{ profile?: any }>("/farmer/profile");

      // safe-guard: default to null if profile is missing
      set({ profile: data?.profile ?? null, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch profile", loading: false });
    }
  },
}));


















// // stores/farmerStore.ts
// import { create } from "zustand";
// import { apiFetch } from "@/lib/api";

// interface FarmerState {
//   profile: any;
//   loading: boolean;
//   error: string | null;

//   fetchProfile: () => Promise<void>;
// }

// export const useFarmerStore = create<FarmerState>((set) => ({
//   profile: null,
//   loading: false,
//   error: null,

//   fetchProfile: async () => {
//     set({ loading: true, error: null });
//     try {
//       // 🔐 token auto-attached by apiFetch
//       const data = await apiFetch<{ profile: any }>("/farmer/profile");
//       set({ profile: data.profile, loading: false });
//     } catch (err: any) {
//       set({ error: err.message, loading: false });
//     }
//   },
// }));
