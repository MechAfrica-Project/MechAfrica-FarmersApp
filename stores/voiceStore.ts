import { create } from "zustand";

export type Recording = {
  id: string;
  uri: string;
  createdAt: string;
};

type VoiceState = {
  recordings: Recording[];
  addRecording: (uri: string) => void;
  removeRecording: (id: string) => void;
  clearRecordings: () => void;
};

export const useVoiceStore = create<VoiceState>((set, get) => ({
  recordings: [],
  addRecording: (uri: string) => {
    const rec = { id: Date.now().toString(), uri, createdAt: new Date().toISOString() };
    set((s) => ({ recordings: [...s.recordings, rec] }));
    return rec;
  },
  removeRecording: (id: string) => set((s) => ({ recordings: s.recordings.filter((r) => r.id !== id) })),
  clearRecordings: () => set({ recordings: [] }),
}));

export default useVoiceStore;
