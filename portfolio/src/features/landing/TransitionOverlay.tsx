'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useSceneStore } from '@/shared/store'

export default function TransitionOverlay() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 bg-black pointer-events-none"
        />
      )}
    </AnimatePresence>
  )
}
