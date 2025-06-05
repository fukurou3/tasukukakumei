// hooks/useUnsavedStore.ts
import { create } from 'zustand';

type UnsavedStore = {
  unsaved: boolean;
  setUnsaved: (v: boolean) => void;
  reset: () => void;
};

export const useUnsavedStore = create<UnsavedStore>((set) => ({
  unsaved: false,
  setUnsaved: (v: boolean) => set({ unsaved: v }),
  reset: () => set({ unsaved: false }),
}));
