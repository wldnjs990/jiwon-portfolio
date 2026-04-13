'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useLandingStore } from './landingStore'
import { useSceneStore } from '@/shared/store'

export default function ExploreToggle() {
  const { isExploreMode, setExploreMode } = useLandingStore()
  const currentScene = useSceneStore((s) => s.currentScene)

  if (currentScene !== 'landing') return null

  return (
    <button
      onClick={() => setExploreMode(!isExploreMode)}
      className={`
        absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2
        rounded-full text-sm font-medium transition-all duration-200
        ${isExploreMode
          ? 'bg-black/70 text-white shadow-lg'
          : 'bg-white/80 text-black/70 hover:bg-white shadow-md'
        }
      `}
    >
      {isExploreMode ? <Eye size={16} /> : <EyeOff size={16} />}
      <span>{isExploreMode ? '체험 모드' : '기본 모드'}</span>
    </button>
  )
}
