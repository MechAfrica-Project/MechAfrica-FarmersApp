import { create } from "zustand";

export interface ServiceDraft {
  serviceId?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  message?: string;
  attachments?: string[];
}

interface ServiceFlowState {
  draft: ServiceDraft;
  setServiceId: (id?: string) => void;
  setStartDate: (iso?: string) => void;
  setEndDate: (iso?: string) => void;
  setMessage: (text: string) => void;
  addAttachment: (uri: string) => void;
  removeAttachment: (uri: string) => void;
  clearDraft: () => void;
}

export const useServiceFlowStore = create<ServiceFlowState>((set, get) => ({
  draft: { attachments: [] },

  setServiceId: (id) => set((s) => ({ draft: { ...s.draft, serviceId: id } })),

  setStartDate: (iso) => set((s) => ({ draft: { ...s.draft, startDate: iso } })),

  setEndDate: (iso) => set((s) => ({ draft: { ...s.draft, endDate: iso } })),

  setMessage: (text) => set((s) => ({ draft: { ...s.draft, message: text } })),

  addAttachment: (uri) =>
    set((s) => ({ draft: { ...s.draft, attachments: [...(s.draft.attachments || []), uri] } })),

  removeAttachment: (uri) =>
    set((s) => ({ draft: { ...s.draft, attachments: (s.draft.attachments || []).filter((u) => u !== uri) } })),

  clearDraft: () => set({ draft: { attachments: [] } }),
}));

export default useServiceFlowStore;
