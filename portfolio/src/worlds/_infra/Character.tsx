import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { useCharacterMovement } from './useCharacterMovement'

const ANIM_IDLE = 'idle'
const ANIM_WALK = 'walk'
const FADE_DURATION = 0.2

interface CharacterProps {
  initialPosition?: [number, number, number]
}

export default function Character({ initialPosition = [0, 0.5, 0] }: CharacterProps) {
  const { scene, animations } = useGLTF('/nong_dam_gom.glb')
  const rb = useRef<RapierRigidBody>(null)
  const modelRef = useRef<Group>(null)
  const { actions } = useAnimations(animations, modelRef)

  const { isMovingRef } = useCharacterMovement(rb, modelRef)

  // 초기 idle 애니메이션 실행
  useEffect(() => {
    actions[ANIM_IDLE]?.play()
  }, [actions])

  // 이동 상태 변화 감지 → fadeIn/fadeOut 전환
  const prevMovingRef = useRef(false)
  useFrame(() => {
    const moving = isMovingRef.current ?? false
    if (moving === prevMovingRef.current) return
    prevMovingRef.current = moving

    if (moving) {
      actions[ANIM_IDLE]?.fadeOut(FADE_DURATION)
      actions[ANIM_WALK]?.reset().fadeIn(FADE_DURATION).play()
    } else {
      actions[ANIM_WALK]?.fadeOut(FADE_DURATION)
      actions[ANIM_IDLE]?.reset().fadeIn(FADE_DURATION).play()
    }
  })

  return (
    <RigidBody
      ref={rb}
      type="dynamic"
      colliders={false}
      position={initialPosition}
      gravityScale={0}
      lockRotations
      enabledTranslations={[true, false, true]}
      linearDamping={12}
      canSleep={false}
      friction={0}
      restitution={0}
    >
      {/* friction=0 + restitution=0: 바닥·벽 접촉 시 마찰 저항 제거 */}
      <CapsuleCollider args={[0.3, 0.3]} friction={0} restitution={0} />
      {/* 캡슐 중심 y=0.7 기준 — 발이 바닥(y=0)에 닿게 오프셋 */}
      <group ref={modelRef} position={[0, -0.7, 0]}>
        <primitive object={scene} scale={0.5} />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/nong_dam_gom.glb')
