import { create } from "zustand";

interface useGirisModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useGirisModal = create<useGirisModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
