import { create } from "zustand";
import { apiFetch } from "@/lib/api";

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}

export interface Crop {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

interface CatalogState {
  services: Service[];
  crops: Crop[];
  loading: boolean;
  error: string | null;
  fetchCatalogs: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  services: [],
  crops: [],
  loading: false,
  error: null,
  
  fetchCatalogs: async () => {
    set({ loading: true, error: null });
    try {
      const [servicesRes, cropsRes] = await Promise.all([
        apiFetch<any>("/catalog/services"),
        apiFetch<any>("/catalog/crops"),
      ]);

      // Backend returns a plain array; handle both { data: [] } and direct [] shapes
      const rawServices: any[] = servicesRes?.data ?? (Array.isArray(servicesRes) ? servicesRes : []);
      const rawCrops: any[]    = cropsRes?.data    ?? (Array.isArray(cropsRes)    ? cropsRes    : []);

      // Map snake_case API fields → camelCase store interface and filter active only
      const services: Service[] = rawServices
        .filter((s: any) => s.is_active !== false)
        .map((s: any) => ({
          id:          s.id,
          name:        s.name,
          description: s.description ?? "",
          icon:        s.icon,
          imageUrl:    s.image_url ?? s.imageUrl,
        }));

      const crops: Crop[] = rawCrops
        .filter((c: any) => c.is_active !== false)
        .map((c: any) => ({
          id:          c.id,
          name:        c.name,
          description: c.description ?? "",
          imageUrl:    c.image_url ?? c.imageUrl,
        }));

      if (__DEV__) {
        console.log(`[CatalogStore] Fetched ${crops.length} crops, ${services.length} services`);
      }

      set({ services, crops, loading: false });
    } catch (error: any) {
      console.error("[CatalogStore] Error fetching catalogs:", error?.message ?? error);
      set({ error: error.message || "Failed to load catalogs", loading: false });
    }
  },
}));
