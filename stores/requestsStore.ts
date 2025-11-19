import { requestsData } from "@/dummy-data/dummy_data";
import { Request, RequestStatus } from "@/types/request";
import { create } from "zustand";

type RequestsState = {
  byId: Record<string, Request>;
  listsByStatus: Record<RequestStatus, Request[]>;
  getByStatus: (status: RequestStatus) => Request[];
  activeRequestId?: string | null;
  setActiveRequest: (id?: string | null) => void;
  getActiveRequest: () => Request | null;
  cancelRequest: (id: string) => void;
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

const computeListsByStatus = (
  byId: Record<string, Request>
): Record<RequestStatus, Request[]> => ({
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
    activeRequestId: null,

    getByStatus: (status) => get().listsByStatus[status],

    setActiveRequest: (id) => set(() => ({ activeRequestId: id ?? null })),

    getActiveRequest: () => {
      const id = get().activeRequestId;
      if (!id) return null;
      return get().byId[id] ?? null;
    },

    // ✅ Farmer can only cancel their sent request
    cancelRequest: (id) =>
      set((s) => {
        const byId: Record<string, Request> = {
          ...s.byId,
          [id]: {
            ...s.byId[id],
            status: "cancelled" as RequestStatus,
            cancelledBy: "farmer",
          },
        };
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),

    // Optional: Keep for internal use (when service is done)
    completeRequest: (id) =>
      set((s) => {
        const byId: Record<string, Request> = {
          ...s.byId,
          [id]: {
            ...s.byId[id],
            status: "completed" as RequestStatus,
            progress: 1,
          },
        };
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

    // Add a new request to the store (simulated)
    addRequest: (req: Omit<Request, "id" | "status">) =>
      set((s) => {
        const id = Date.now().toString();
        const newReq: Request = {
          id,
          ...req,
          status: "pending",
        } as Request;
        const byId = { ...s.byId, [id]: newReq };
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }),
  };
});
