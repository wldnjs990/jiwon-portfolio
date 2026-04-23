import { create } from 'zustand'

export type OnboardingStep =
  | 'idle'
  | 'welcome'
  | 'drawing'
  | 'camera-aim'
  | 'print-ready'
  | 'printing'
  | 'paper-modal'
  | 'entering'

interface LandingStore {
  isExploreMode: boolean
  setExploreMode: (v: boolean) => void
  onboardingStep: OnboardingStep
  setOnboardingStep: (s: OnboardingStep) => void
  drawnImageUrl: string | null
  setDrawnImageUrl: (url: string | null) => void
  isNearPrinter: boolean
  setNearPrinter: (v: boolean) => void
  isPrinterFocused: boolean
  setIsPrinterFocused: (v: boolean) => void
}

export const useLandingStore = create<LandingStore>((set) => ({
  isExploreMode: false,
  setExploreMode: (v) => set({ isExploreMode: v }),
  onboardingStep: 'idle',
  setOnboardingStep: (s) => set({ onboardingStep: s }),
  drawnImageUrl: null,
  setDrawnImageUrl: (url) => set({ drawnImageUrl: url }),
  isNearPrinter: false,
  setNearPrinter: (v) => set({ isNearPrinter: v }),
  isPrinterFocused: false,
  setIsPrinterFocused: (v) => set({ isPrinterFocused: v }),
}))
