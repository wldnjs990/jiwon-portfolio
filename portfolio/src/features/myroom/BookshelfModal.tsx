'use client'

import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useMyroomStore } from './myroomStore'
import TerritoryGame from './TerritoryGame'

export default function BookshelfModal() {
  const { isModalOpen, setModalOpen } = useMyroomStore()

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-5 max-w-md w-full mx-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">🗺 땅따먹기</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  타일 선택: 1/2/3키 &nbsp;|&nbsp; 공격: 상대 타일 클릭
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <TerritoryGame />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
