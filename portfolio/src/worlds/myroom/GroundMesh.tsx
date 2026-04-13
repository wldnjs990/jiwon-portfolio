import { RigidBody } from '@react-three/rapier'

export default function GroundMesh() {
  return (
    <>
      {/* 바닥 — 나무 바닥 느낌 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#c8a96e" roughness={0.8} metalness={0.0} />
        </mesh>
        {/* 물리 충돌용 얇은 박스 */}
        <mesh position={[0, -0.05, 0]} visible={false}>
          <boxGeometry args={[12, 0.1, 12]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>

      {/* 후면 벽 (Z-) — 청록/녹색 계열 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 2, -6]} receiveShadow castShadow>
          <boxGeometry args={[12, 4, 0.12]} />
          <meshStandardMaterial color="#7aab96" roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 좌면 벽 (X-) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-6, 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.12, 4, 12]} />
          <meshStandardMaterial color="#6b9d8c" roughness={0.7} />
        </mesh>
      </RigidBody>
    </>
  )
}
