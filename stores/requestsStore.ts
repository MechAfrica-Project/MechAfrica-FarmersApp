import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { Request, RequestStatus } from "@/types/request";
import { create } from "zustand";

type RequestsState = {
  byId: Record<string, Request>;
  listsByStatus: Record<RequestStatus, Request[]>;
  loading: boolean;
  error: string | null;
  getByStatus: (status: RequestStatus) => Request[];
  activeRequestId?: string | null;
  setActiveRequest: (id?: string | null) => void;
  getActiveRequest: () => Request | null;
  cancelRequest: (id: string) => void;
  completeRequest: (id: string) => void;
  deleteRequest: (id: string) => Promise<void>;
  deleteCancelled: () => void;
  deleteCompleted: () => void;
  // Restore a request for undo flows
  restoreRequest: (req: Request) => void;
  addRequest: (req: Omit<Request, "id" | "status">) => Promise<void>;
  fetchRequests: () => Promise<void>;
};

// helper removed (unused): indexById

const computeListsByStatus = (
  byId: Record<string, Request>
): Record<RequestStatus, Request[]> => ({
  pending: Object.values(byId).filter((r) => r.status === "pending"),
  ongoing: Object.values(byId).filter((r) => r.status === "ongoing"),
  completed: Object.values(byId).filter((r) => r.status === "completed"),
  cancelled: Object.values(byId).filter((r) => r.status === "cancelled"),
});

export const useRequestsStore = create<RequestsState>((set, get) => {
  const initialById: Record<string, Request> = {};
  return {
    byId: initialById,
    listsByStatus: computeListsByStatus(initialById),
    loading: false,
    error: null,
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

    deleteRequest: async (id: string) => {
      try {
        await apiFetch(`${API_ENDPOINTS.REQUESTS}/${id}`, { method: "DELETE" });
        set((s) => {
          const byId = { ...s.byId };
          delete byId[id];
          return { byId, listsByStatus: computeListsByStatus(byId) };
        });
      } catch {
        // Fallback to local delete if API fails
        set((s) => {
          const byId = { ...s.byId };
          delete byId[id];
          return { byId, listsByStatus: computeListsByStatus(byId) };
        });
      }
    },

    // Restore a request (used for Undo actions in the UI)
    restoreRequest: (req: Request) =>
      set((s) => {
        if (s.byId[req.id]) return { byId: s.byId, listsByStatus: s.listsByStatus };
        const byId = { ...s.byId, [req.id]: req };
        return { byId, listsByStatus: computeListsByStatus(byId) };
      }, false),

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

    // Add a new request to the store (tries backend, falls back locally)
    addRequest: async (req: Omit<Request, "id" | "status">) => {
      try {
        const saved = await apiFetch<Request | { queued: true; queuedId: string }>(API_ENDPOINTS.REQUESTS, {
          method: "POST",
          body: JSON.stringify(req),
        });

        // If the API wrapper enqueued the request while offline it returns { queued: true, queuedId }
        if ((saved as any)?.queued) {
          const id = Date.now().toString();
          const newReq: any = { id, ...(req as any), status: "pending", _queued: true, _queuedId: (saved as any).queuedId };
          set((s) => ({ byId: { ...s.byId, [id]: newReq }, listsByStatus: computeListsByStatus({ ...s.byId, [id]: newReq }) }));
          const { toastQueued } = await import('@/lib/toast');
          toastQueued("Saved offline", "Request queued for upload");
          return;
        }

        // Normal server-saved response
        const serverReq = saved as Request;
        set((s) => ({ byId: { ...s.byId, [serverReq.id]: serverReq }, listsByStatus: computeListsByStatus({ ...s.byId, [serverReq.id]: serverReq }) }));
      } catch {
        // Fallback: create local request id
        set((s) => {
          const id = Date.now().toString();
          const newReq: Request = { id, ...req, status: "pending" } as Request;
          const byId = { ...s.byId, [id]: newReq };
          return { byId, listsByStatus: computeListsByStatus(byId) };
        });
      }
    },

    // Fetch requests from backend (merge into store); call this on app start or when needed
    fetchRequests: async () => {
      set({ loading: true, error: null });
      try {
        const data = await apiFetch<{ requests: Request[] }>(API_ENDPOINTS.REQUESTS);
        const byId: Record<string, Request> = {};
        for (const r of data.requests || []) byId[r.id] = r;
        // Merge with existing local items (local items keep priority if ids clash)
        set((s) => ({
          byId: { ...byId, ...s.byId },
          listsByStatus: computeListsByStatus({ ...byId, ...s.byId }),
          loading: false,
        }));
      } catch (err: any) {
        console.warn("fetchRequests failed", err);
        set({ loading: false, error: err?.message || "Failed to fetch requests" });
      }
    },
  };
});
