import { requestsData } from "@/dummy-data/dummy_data";
import { Request, RequestStatus } from "@/types/request";
import { create } from "zustand";

type RequestsState = {
  byId: Record<string, Request>;
  listsByStatus: Record<RequestStatus, Request[]>;
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

const computeListsByStatus = (byId: Record<string, Request>): Record<RequestStatus, Request[]> => ({
  pending: Object.values(byId).filter((r) => r.status === "pending"),
  ongoing: Object.values(byId).filter((r) => r.status === "ongoing"),
  completed: Object.values(byId).filter((r) => r.status === "completed"),
  cancelled: Object.values(byId).filter((r) => r.status === "cancelled"),
});

export const useRequestsStore = create<RequestsState>((set, get) => {
  const initialById = indexById(requestsData);
  return {
    byId: initialById,
    listsByStatus: computeListsByStatus(initialById),

    getByStatus: (status) => get().listsByStatus[status],

    acceptRequest: (id) =>
      set((s) => {
        const byId = { ...s.byId, [id]: { ...s.byId[id], status: "ongoing" } };
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),

    rejectRequest: (id) =>
      set((s) => {
        const byId = {
          ...s.byId,
          [id]: { ...s.byId[id], status: "cancelled", cancelledBy: "provider" },
        };
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),

    completeRequest: (id) =>
      set((s) => {
        const byId = { ...s.byId, [id]: { ...s.byId[id], status: "completed", progress: 1 } };
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),

    deleteRequest: (id) =>
      set((s) => {
        const byId = { ...s.byId };
        delete byId[id];
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),

    deleteCancelled: () =>
      set((s) => {
        const byId: Record<string, Request> = {};
        for (const [id, r] of Object.entries(s.byId)) {
          if (r.status !== "cancelled") byId[id] = r;
        }
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),

    deleteCompleted: () =>
      set((s) => {
        const byId: Record<string, Request> = {};
        for (const [id, r] of Object.entries(s.byId)) {
          if (r.status !== "completed") byId[id] = r;
        }
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),
  };
});


