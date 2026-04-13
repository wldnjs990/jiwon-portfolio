import { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { useCharacterMovement } from './useCharacterMovement'

interface CharacterProps {
  initialPosition?: [number, number, number]
}

export default function Character({ initialPosition = [0, 0.5, 0] }: CharacterProps) {
  const { scene, animations } = useGLTF('/nong_dam_gom.glb')
  const { actions } = useAnimations(animations, scene)
  const rb = useRef<RapierRigidBody>(null)
  const modelRef = useRef<Group>(null)

  // 개발 중 애니메이션 클립 이름 확인
  if (process.env.NODE_ENV === 'development' && animations.length > 0) {
    console.log('[Character] animation clips:', animations.map((a) => a.name))
  }

  useCharacterMovement(rb, actions, modelRef)

  return (
    <RigidBody
      ref={rb}
      type="kinematicPosition"
      colliders={false}
      position={initialPosition}
    >
      <CapsuleCollider args={[0.3, 0.3]} />
      <group ref={modelRef}>
        <primitive object={scene} scale={0.5} />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/nong_dam_gom.glb')
