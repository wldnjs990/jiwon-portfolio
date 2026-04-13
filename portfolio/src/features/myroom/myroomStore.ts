import { create } from 'zustand'

interface MyroomStore {
  isModalOpen: boolean
  setModalOpen: (v: boolean) => void
}

export const useMyroomStore = create<MyroomStore>((set) => ({
  isModalOpen: false,
  setModalOpen: (v) => set({ isModalOpen: v }),
}))
