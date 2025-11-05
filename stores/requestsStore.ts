import { requestsData } from "@/dummy-data/dummy_data";
import { Request, RequestStatus } from "@/types/request";
import { create } from "zustand";

type RequestsState = {
  byId: Record<string, Request>;
  getByStatus: (status: RequestStatus) => Request[];
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  completeRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  deleteCancelled: () => void;
  deleteCompleted: () => void;
};

const indexById = (list: Request[]): Record<string, Request> => {
  const out: Record<string, Request> = {};
  for (const r of list) out[r.id] = r;
  return out;
};

export const useRequestsStore = create<RequestsState>((set, get) => ({
  byId: indexById(requestsData),

  getByStatus: (status) =>
    Object.values(get().byId).filter((r) => r.status === status),

  acceptRequest: (id) =>
    set((s) => ({ byId: { ...s.byId, [id]: { ...s.byId[id], status: "ongoing" } } })),

  rejectRequest: (id) =>
    set((s) => ({
      byId: { ...s.byId, [id]: { ...s.byId[id], status: "cancelled", cancelledBy: "provider" } },
    })),

  completeRequest: (id) =>
    set((s) => ({ byId: { ...s.byId, [id]: { ...s.byId[id], status: "completed", progress: 1 } } })),
  
  deleteRequest: (id) =>
    set((s) => {
      const copy = { ...s.byId };
      delete copy[id];
      return { byId: copy };
    }),

  deleteCancelled: () =>
    set((s) => {
      const copy: Record<string, Request> = {};
      for (const [id, r] of Object.entries(s.byId)) {
        if (r.status !== "cancelled") copy[id] = r;
      }
      return { byId: copy };
    }),

  deleteCompleted: () =>
    set((s) => {
      const copy: Record<string, Request> = {};
      for (const [id, r] of Object.entries(s.byId)) {
        if (r.status !== "completed") copy[id] = r;
      }
      return { byId: copy };
    }),
}));


