import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useLandingStore } from '@/features/landing/landingStore'
import { useSceneStore } from '@/shared/store'

// Phase 1: 카메라가 뚜껑 위쪽으로 이동
const PHASE1_POS = new Vector3(0, 2.2, 1.2)
const PHASE1_LOOKAT = new Vector3(0, 0.7, 0)

// Phase 2: 슬릿(프린트 출구)으로 빨려들어가는 최종 위치
const PHASE2_POS = new Vector3(0, 0.72, 0.3)

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function useLandingCamera() {
  const isExploreMode = useLandingStore((s) => s.isExploreMode)
  const setScene = useSceneStore((s) => s.setScene)
  const setTransitioning = useSceneStore((s) => s.setTransitioning)

  const phase = useRef<'idle' | 'phase1' | 'phase2'>('idle')
  const progress = useRef(0)
  const phase1StartPos = useRef(new Vector3())

  const startTransition = () => {
    if (isExploreMode || phase.current !== 'idle') return
    setTransitioning(true)
    phase.current = 'phase1'
    progress.current = 0
  }

  useFrame((state, delta) => {
    if (phase.current === 'idle') return

    const { camera } = state

    if (phase.current === 'phase1') {
      if (progress.current === 0) {
        phase1StartPos.current.copy(camera.position)
      }
      progress.current += delta * 0.9
      const t = easeInOut(Math.min(progress.current, 1))

      camera.position.lerpVectors(phase1StartPos.current, PHASE1_POS, t)
      camera.lookAt(PHASE1_LOOKAT)

      if (progress.current >= 1) {
        phase.current = 'phase2'
        progress.current = 0
      }
    }

    if (phase.current === 'phase2') {
      progress.current += delta
      // 가속도 증가: 처음엔 느리다가 빠르게 빨려드는 효과
      const speed = 0.04 + progress.current * progress.current * 0.5
      camera.position.lerp(PHASE2_POS, Math.min(speed, 0.9))
      camera.lookAt(PHASE1_LOOKAT)

      const dist = camera.position.distanceTo(PHASE2_POS)
      if (dist < 0.12) {
        phase.current = 'idle'
        setScene('myroom')
        setTransitioning(false)
      }
    }
  })

  return { startTransition }
}
