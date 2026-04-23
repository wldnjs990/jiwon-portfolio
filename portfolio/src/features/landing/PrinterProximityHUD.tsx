'use client'
import { motion, AnimatePresence } from 'motion/react'
import { useLandingStore } from './landingStore'

export default function PrinterProximityHUD() {
  const isNearPrinter = useLandingStore((s) => s.isNearPrinter)
  const isPrinterFocused = useLandingStore((s) => s.isPrinterFocused)
  const onboardingStep = useLandingStore((s) => s.onboardingStep)
  const setIsPrinterFocused = useLandingStore((s) => s.setIsPrinterFocused)
  const setExploreMode = useLandingStore((s) => s.setExploreMode)

  // 자유 이동 모드 + 프린터 근접 + 온보딩 미진행 시만 표시
  const visible = isNearPrinter && !isPrinterFocused && onboardingStep === 'idle'

  const handleClick = () => {
    setIsPrinterFocused(true)
    setExploreMode(true) // 살펴보기 진입 = 체험 모드로 시작
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          <button
            onClick={handleClick}
            className="px-6 py-3 rounded-full bg-white/90 text-black font-semibold
              shadow-lg hover:bg-white active:scale-95 transition-all duration-150
              border border-white/50"
          >
            네모닉 살펴보기
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
