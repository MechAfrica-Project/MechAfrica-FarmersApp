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
      // Use Promise.all to fetch both simultaneously
      const [servicesRes, cropsRes] = await Promise.all([
        apiFetch<any>("/catalog/services"),
        apiFetch<any>("/catalog/crops"),
      ]);

      const services = servicesRes?.data || servicesRes || [];
      const crops = cropsRes?.data || cropsRes || [];

      set({ services, crops, loading: false });
    } catch (error: any) {
      console.error("Error fetching catalogs:", error);
      set({ error: error.message || "Failed to load catalogs", loading: false });
    }
  },
}));
