import { create } from "zustand";

interface useCikisModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCikisModal = create<useCikisModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));