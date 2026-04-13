import { RefObject, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WALK_SPEED = 8
const LEG_SWING = 0.55   // 다리 최대 스윙 각도 (라디안)
const ARM_SWING = 0.45   // 팔 최대 스윙 각도 (라디안)
const RETURN_LERP = 10   // 정지 시 원위치 복귀 속도

interface AnimationRefs {
  leftLegRef: RefObject<THREE.Group>
  rightLegRef: RefObject<THREE.Group>
  leftArmRef: RefObject<THREE.Group>
  rightArmRef: RefObject<THREE.Group>
  isMovingRef: { current: boolean }
}

/**
 * 걷기 애니메이션: 이동 중에는 팔다리를 사인파로 흔들고,
 * 정지 시에는 lerp로 자연스럽게 원위치로 돌아옵니다.
 */
export function useCharacterAnimation({
  leftLegRef,
  rightLegRef,
  leftArmRef,
  rightArmRef,
  isMovingRef,
}: AnimationRefs) {
  const walkCycle = useRef(0)

  useFrame((_, delta) => {
    const moving = isMovingRef.current

    if (moving) {
      walkCycle.current += delta * WALK_SPEED
      const swing = Math.sin(walkCycle.current)

      if (leftLegRef.current) leftLegRef.current.rotation.x = swing * LEG_SWING
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing * LEG_SWING
      // 팔은 다리와 반대 위상으로 (자연스러운 걸음걸이)
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * ARM_SWING
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * ARM_SWING
    } else {
      // 정지 시 부드럽게 원위치
      const t = Math.min(RETURN_LERP * delta, 1)
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, t)
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, t)
      if (leftArmRef.current)
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, t)
      if (rightArmRef.current)
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, t)
    }
  })
}
