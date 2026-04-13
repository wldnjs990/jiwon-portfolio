import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { AnimationAction, Group } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'

interface Actions {
  [key: string]: AnimationAction | null | undefined
}

const SPEED = 3
const ROTATE_SPEED = 0.15

// e.key.toLowerCase() 기준 키 목록
type KeyState = {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
  arrowup: boolean
  arrowdown: boolean
  arrowleft: boolean
  arrowright: boolean
}

export function useCharacterMovement(
  rb: React.RefObject<RapierRigidBody | null>,
  actions: Actions,
  modelRef: React.RefObject<Group | null>
) {
  const keys = useRef<KeyState>({
    w: false, a: false, s: false, d: false,
    arrowup: false, arrowdown: false, arrowleft: false, arrowright: false,
  })
  const currentAnim = useRef<'idle' | 'walk'>('idle')
  const initialized = useRef(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase() as keyof KeyState
      if (k in keys.current) keys.current[k] = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase() as keyof KeyState
      if (k in keys.current) keys.current[k] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    // idle 초기화 — actions가 로드될 때까지 매 프레임 재시도
    if (!initialized.current) {
      if (actions['idle']) {
        actions['idle'].reset().play()
        initialized.current = true
      }
      return
    }

    const { w, a, s, d, arrowup, arrowdown, arrowleft, arrowright } = keys.current
    const dx = ((d || arrowright) ? 1 : 0) - ((a || arrowleft) ? 1 : 0)
    const dz = ((s || arrowdown) ? 1 : 0) - ((w || arrowup) ? 1 : 0)
    const isMoving = dx !== 0 || dz !== 0

    // 애니메이션 전환
    if (isMoving && currentAnim.current === 'idle') {
      actions['idle']?.stop()
      actions['walk']?.reset().play()
      currentAnim.current = 'walk'
    } else if (!isMoving && currentAnim.current === 'walk') {
      actions['walk']?.stop()
      actions['idle']?.reset().play()
      currentAnim.current = 'idle'
    }

    // 이동 방향으로 모델 회전 (부드러운 lerp)
    if (isMoving && modelRef.current) {
      const targetAngle = Math.atan2(dx, dz)
      let diff = targetAngle - modelRef.current.rotation.y
      // [-PI, PI] 범위로 정규화 — 최단 방향으로 회전
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      modelRef.current.rotation.y += diff * ROTATE_SPEED
    }

    // 위치 갱신 — 월드 축 기준
    if (isMoving && rb.current) {
      const len = Math.sqrt(dx * dx + dz * dz)
      const move = SPEED * delta
      const pos = rb.current.translation()
      rb.current.setNextKinematicTranslation({
        x: pos.x + (dx / len) * move,
        y: pos.y,
        z: pos.z + (dz / len) * move,
      })
    }
  })
}
