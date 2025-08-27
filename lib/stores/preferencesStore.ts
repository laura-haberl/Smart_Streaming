import { create } from "zustand";

interface PreferencesStore {
    preferencesUpdatedAt: number;
    setPreferencesUpdated: () => void;
}

//Store-Instanz
export const preferencesStore = create<PreferencesStore>((set) => ({
    preferencesUpdatedAt: Date.now(),
    setPreferencesUpdated: () => set({ preferencesUpdatedAt: Date.now() }),
}));

//React-kompatible Hook
export const usePreferencesStore = preferencesStore;
