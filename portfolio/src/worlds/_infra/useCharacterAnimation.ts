import { useEffect, useRef } from 'react'
import { useAnimations } from '@react-three/drei'
import { LoopOnce } from 'three'
import type { AnimationClip, AnimationAction, Group } from 'three'

const ANIM_IDLE = 'idle'
const ANIM_WALK = 'walk'
const ANIM_DANCE = 'dance'
const FADE_DURATION = 0.2

/**
 * useAnimations 래퍼 훅.
 * AnimationAction 프로퍼티 뮤테이션(clampWhenFinished 등)을
 * 훅 내부에서 처리해 React Compiler 규칙을 준수한다.
 */
export function useCharacterAnimation(
  animations: AnimationClip[],
  modelRef: React.RefObject<Group | null>,
  isMovingRef: React.RefObject<boolean>,
) {
  const { actions, mixer } = useAnimations(animations, modelRef)
  const isDancingRef = useRef(false)

  // 초기 idle 실행
  useEffect(() => {
    actions[ANIM_IDLE]?.play()
  }, [actions])

  // dance LoopOnce 설정 + 완료 시 idle 복귀
  // clampWhenFinished 뮤테이션을 훅 내부에서 처리
  useEffect(() => {
    const danceAction = actions[ANIM_DANCE]
    if (!danceAction) return

    danceAction.setLoop(LoopOnce, 1)
    // eslint-disable-next-line react-hooks/immutability
    danceAction.clampWhenFinished = true

    const handleFinished = (e: { action: AnimationAction }) => {
      if (e.action !== danceAction) return
      isDancingRef.current = false
      actions[ANIM_IDLE]?.reset().fadeIn(FADE_DURATION).play()
    }

    mixer.addEventListener('finished', handleFinished as (e: object) => void)
    return () => mixer.removeEventListener('finished', handleFinished as (e: object) => void)
  }, [actions, mixer])

  // Ctrl+4 → dance 시작
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey && e.key === '3')) return
      e.preventDefault()
      if (isDancingRef.current || isMovingRef.current) return
      isDancingRef.current = true
      actions[ANIM_IDLE]?.fadeOut(FADE_DURATION)
      actions[ANIM_DANCE]?.reset().fadeIn(FADE_DURATION).play()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [actions, isMovingRef])

  return { actions, isDancingRef }
}
