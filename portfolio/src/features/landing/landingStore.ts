import { create } from 'zustand'

interface LandingStore {
  isExploreMode: boolean
  setExploreMode: (v: boolean) => void
}

export const useLandingStore = create<LandingStore>((set) => ({
  isExploreMode: false,
  setExploreMode: (v) => set({ isExploreMode: v }),
}))
