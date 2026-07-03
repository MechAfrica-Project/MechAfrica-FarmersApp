import { apiFetch, uploadFile } from "@/lib/api";
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
  updateRequestDetails: (id: string, extraComment?: string, voiceNoteUri?: string | null) => Promise<void>;
  fetchRequests: () => Promise<void>;
  reset: () => void;
};

// helper removed (unused): indexById

const computeListsByStatus = (
  byId: Record<string, Request>
): Record<RequestStatus, Request[]> => {
  const result: Record<RequestStatus, Request[]> = { pending: [], ongoing: [], completed: [], cancelled: [] };
  for (const r of Object.values(byId)) {
    if (result[r.status]) result[r.status].push(r);
  }
  return result;
};

// Helper to reliably translate backend snake_case nested models to frontend camelCase Request interface
const mapBackendRequestToFrontend = (rawInput: any): Request => {
  if (!rawInput) return {} as Request;
  
  // Unwrap standard Go APIResponse `{ data: ... }` envelope if wrapped
  const raw = rawInput.data ?? rawInput;

  // If already mapped (fallback offline), return it directly
  if (raw.serviceTitle && raw.farmerName) return raw as Request;

  return {
    id: raw.request_id || raw.id,
    serviceId: raw.service_type || "Unknown",
    serviceTitle: raw.service_type || "Unknown Service",
    serviceDetails: raw.extra_comment || "",
    farmerName: raw.farmer ? `${raw.farmer.user?.first_name || raw.farmer.first_name || ""} ${raw.farmer.user?.last_name || raw.farmer.last_name || ""}`.trim() : "Unknown Farmer",
    farmLocation: raw.farm?.farm_name || raw.farm_name || raw.farmLocation || (raw.farmer?.farm_name) || "Unknown Farm",
    farmLatitude: raw.farm?.latitude ?? raw.farmLatitude ?? raw.latitude ?? raw.farmer?.latitude ?? raw.farm_latitude ?? undefined,
    farmLongitude: raw.farm?.longitude ?? raw.farmLongitude ?? raw.longitude ?? raw.farmer?.longitude ?? raw.farm_longitude ?? undefined,
    providerName: raw.service_provider?.company_name || "Unassigned",
    startDateTime: raw.start_date || new Date().toISOString(),
    endDateTime: raw.end_date || new Date().toISOString(),
    status: (raw.status as RequestStatus) || "pending",
    crop: raw.crop_type,
    messageFromFarmer: raw.extra_comment,
    voiceNoteUrl: raw.voiceNoteUrl || raw.voice_note_url,
  };
};

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
        let finalVoiceNoteUrl = req.voiceNoteUrl;

        // If it's a local file URI from expo-audio, upload it first
        if (finalVoiceNoteUrl && finalVoiceNoteUrl.startsWith("file://")) {
          try {
            const uploadRes: any = await uploadFile(
              API_ENDPOINTS.UPLOADS,
              { uri: finalVoiceNoteUrl, name: "voicenote.m4a", type: "audio/m4a" }
            );
            if (uploadRes && uploadRes.url) {
              finalVoiceNoteUrl = uploadRes.url;
            }
          } catch (uploadErr) {
            console.error("Voice note upload failed:", uploadErr);
          }
        }

        // Construct the payload the backend expects for MobileCreateRequestInput
        const payload = {
          serviceId: req.serviceId,
          serviceTitle: req.serviceTitle,
          farmId: (req as any).farmId || undefined,
          farmLocation: req.farmLocation || "",
          farmSize: (req as any).farmSize || 1, // Fallback to 1 if missing
          crop: req.crop || "Unknown",
          messageFromFarmer: req.messageFromFarmer || "",
          voiceNoteUrl: finalVoiceNoteUrl || "",
          startDateTime: req.startDateTime || new Date().toISOString(),
          endDateTime: req.endDateTime || new Date().toISOString()
        };

        const saved = await apiFetch<Request | { queued: true; queuedId: string }>(API_ENDPOINTS.REQUESTS, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        // If the API wrapper enqueued the request while offline it returns { queued: true, queuedId }
        if ((saved as any)?.queued) {
          const id = Date.now().toString();
          const newReq: any = { id, ...req, status: "pending", _queued: true, _queuedId: (saved as any).queuedId };
          set((s) => ({ byId: { ...s.byId, [id]: newReq }, listsByStatus: computeListsByStatus({ ...s.byId, [id]: newReq }) }));
          const { toastQueued } = await import('@/lib/toast');
          toastQueued("Saved offline", "Request queued for upload");
          return;
        }

        // Normal server-saved response
        const serverReq = mapBackendRequestToFrontend(saved);
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

    updateRequestDetails: async (id: string, extraComment?: string, voiceNoteUri?: string | null) => {
      set({ loading: true, error: null });
      try {
        let finalVoiceNoteUrl = voiceNoteUri;

        // If it's a local file URI, upload it first
        if (voiceNoteUri && voiceNoteUri.startsWith("file://")) {
          try {
            const uploadRes: any = await uploadFile(
              API_ENDPOINTS.UPLOADS,
              { uri: voiceNoteUri, name: "voicenote_edit.m4a", type: "audio/m4a" }
            );
            if (uploadRes && uploadRes.url) {
              finalVoiceNoteUrl = uploadRes.url;
            }
          } catch (uploadErr) {
            console.error("Audio upload failed:", uploadErr);
          }
        }

        const payload: any = {};
        if (extraComment !== undefined) payload.extra_comment = extraComment;
        if (finalVoiceNoteUrl !== undefined) payload.voice_note_url = finalVoiceNoteUrl === null ? "" : finalVoiceNoteUrl; // Send empty string for deletion

        const mergedResponse = await apiFetch<Request>(
          `/farmer/service-requests/${id}/details`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        set((s) => {
          const mappedUpdate = mapBackendRequestToFrontend(mergedResponse);
          const updatedReq = { ...s.byId[id], ...mappedUpdate };
          const byId = { ...s.byId, [id]: updatedReq };
          return { byId, listsByStatus: computeListsByStatus(byId), loading: false };
        });
      } catch (err: any) {
        console.error("Failed to update request:", err);
        set({ loading: false, error: err?.message || "Failed to update request details" });
        throw err;
      }
    },

    // Fetch requests from backend (merge into store); call this on app start or when needed
    fetchRequests: async () => {
      set({ loading: true, error: null });
      try {
        const data = await apiFetch<{ requests: any[] }>(API_ENDPOINTS.REQUESTS);
        const serverById: Record<string, Request> = {};
        for (const raw of data.requests || []) {
          const r = mapBackendRequestToFrontend(raw);
          serverById[r.id] = r;
        }
        // Server data wins; preserve only locally-queued (offline) items
        set((s) => {
          const localQueued: Record<string, Request> = {};
          for (const [id, r] of Object.entries(s.byId)) {
            if ((r as any)._queued) localQueued[id] = r;
          }
          const merged = { ...serverById, ...localQueued };
          return {
            byId: merged,
            listsByStatus: computeListsByStatus(merged),
            loading: false,
          };
        });
      } catch (err: any) {
        console.warn("fetchRequests failed", err);
        set({ loading: false, error: err?.message || "Failed to fetch requests" });
        set({ loading: false, error: err?.message || "Failed to fetch requests" });
      }
    },

    reset: () => set({ byId: {}, listsByStatus: computeListsByStatus({}), error: null }),
  };
});
