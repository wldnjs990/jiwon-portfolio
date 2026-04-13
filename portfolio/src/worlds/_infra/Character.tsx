import { useRef } from 'react'
import * as THREE from 'three'
import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useCharacterMovement } from './hooks/useCharacterMovement'
import { useCharacterAnimation } from './hooks/useCharacterAnimation'

/**
 * 월드 전체에 항상 존재하는 플레이어 캐릭터.
 * kinematicPosition RigidBody로 물리 충돌을 처리하고,
 * 이동 로직(useCharacterMovement)과 걷기 애니메이션(useCharacterAnimation)을
 * 내부에서 자체 관리합니다.
 */
export default function Character() {
  const rbRef = useRef<RapierRigidBody>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const leftLegRef = useRef<THREE.Group>(null!)
  const rightLegRef = useRef<THREE.Group>(null!)
  const leftArmRef = useRef<THREE.Group>(null!)
  const rightArmRef = useRef<THREE.Group>(null!)
  const isMovingRef = useRef(false)

  useCharacterMovement(rbRef, groupRef, isMovingRef)
  useCharacterAnimation({ leftLegRef, rightLegRef, leftArmRef, rightArmRef, isMovingRef })

  return (
    <RigidBody ref={rbRef} type="kinematicPosition" colliders={false} enabledRotations={[false, false, false]}>
      {/* 캡슐 콜라이더: 캐릭터 모델(높이 ~2)을 감싸도록 중심을 y=1로 오프셋 */}
      <CapsuleCollider args={[0.6, 0.38]} position={[0, 1, 0]} />
      <group ref={groupRef}>
      {/* 머리 */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[0.44, 0.44, 0.44]} />
        <meshStandardMaterial color="#FFCBA4" />
      </mesh>

      {/* 목 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.14]} />
        <meshStandardMaterial color="#FFCBA4" />
      </mesh>

      {/* 상체 */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.58, 0.68, 0.26]} />
        <meshStandardMaterial color="#3366CC" />
      </mesh>

      {/* 왼쪽 팔 — 어깨를 pivot으로 */}
      <group ref={leftArmRef} position={[-0.42, 1.42, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <boxGeometry args={[0.17, 0.48, 0.17]} />
          <meshStandardMaterial color="#FFCBA4" />
        </mesh>
        <mesh position={[0, -0.56, 0]} castShadow>
          <boxGeometry args={[0.15, 0.13, 0.12]} />
          <meshStandardMaterial color="#FFCBA4" />
        </mesh>
      </group>

      {/* 오른쪽 팔 — 어깨를 pivot으로 */}
      <group ref={rightArmRef} position={[0.42, 1.42, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <boxGeometry args={[0.17, 0.48, 0.17]} />
          <meshStandardMaterial color="#FFCBA4" />
        </mesh>
        <mesh position={[0, -0.56, 0]} castShadow>
          <boxGeometry args={[0.15, 0.13, 0.12]} />
          <meshStandardMaterial color="#FFCBA4" />
        </mesh>
      </group>

      {/* 왼쪽 다리 — 엉덩이를 pivot으로 */}
      <group ref={leftLegRef} position={[-0.16, 0.75, 0]}>
        {/* 허벅지 */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.22, 0.44, 0.22]} />
          <meshStandardMaterial color="#1a2850" />
        </mesh>
        {/* 정강이 */}
        <mesh position={[0, -0.52, 0]} castShadow>
          <boxGeometry args={[0.20, 0.36, 0.20]} />
          <meshStandardMaterial color="#1a2850" />
        </mesh>
        {/* 신발 */}
        <mesh position={[0, -0.7, 0.04]} castShadow>
          <boxGeometry args={[0.24, 0.1, 0.32]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>

      {/* 오른쪽 다리 — 엉덩이를 pivot으로 */}
      <group ref={rightLegRef} position={[0.16, 0.75, 0]}>
        {/* 허벅지 */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.22, 0.44, 0.22]} />
          <meshStandardMaterial color="#1a2850" />
        </mesh>
        {/* 정강이 */}
        <mesh position={[0, -0.52, 0]} castShadow>
          <boxGeometry args={[0.20, 0.36, 0.20]} />
          <meshStandardMaterial color="#1a2850" />
        </mesh>
        {/* 신발 */}
        <mesh position={[0, -0.7, 0.04]} castShadow>
          <boxGeometry args={[0.24, 0.1, 0.32]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>
    </group>
    </RigidBody>
  )
}
