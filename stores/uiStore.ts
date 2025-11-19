import { create } from "zustand";

type UIState = {
  loading: boolean;
  setLoading: (val: boolean) => void;
  serviceSearch: string;
  setServiceSearch: (val: string) => void;
  // Modals
  addFarmModalVisible: boolean;
  setAddFarmModalVisible: (v: boolean) => void;
  termsModalVisible: boolean;
  setTermsModalVisible: (v: boolean) => void;
  regionPickerVisible: boolean;
  setRegionPickerVisible: (v: boolean) => void;
  districtPickerVisible: boolean;
  setDistrictPickerVisible: (v: boolean) => void;
  // Service filters
  serviceFilters: { category?: string | null; minPrice?: number | null; maxPrice?: number | null };
  setServiceFilters: (filters: { category?: string | null; minPrice?: number | null; maxPrice?: number | null }) => void;
};

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
  serviceSearch: "",
  setServiceSearch: (val: string) => set({ serviceSearch: val }),
  addFarmModalVisible: false,
  setAddFarmModalVisible: (v: boolean) => set({ addFarmModalVisible: v }),
  termsModalVisible: false,
  setTermsModalVisible: (v: boolean) => set({ termsModalVisible: v }),
  regionPickerVisible: false,
  setRegionPickerVisible: (v: boolean) => set({ regionPickerVisible: v }),
  districtPickerVisible: false,
  setDistrictPickerVisible: (v: boolean) => set({ districtPickerVisible: v }),
  // Service filters
  serviceFilters: { category: null, minPrice: null, maxPrice: null },
  setServiceFilters: (filters: { category?: string | null; minPrice?: number | null; maxPrice?: number | null }) => set({ serviceFilters: filters }),
}));
