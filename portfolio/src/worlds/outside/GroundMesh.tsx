import { Grid } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { BoundaryWallsMesh } from '../_shared/mesh'

const FIELD_SIZE = 50

export default function GroundMesh() {
  return (
    <>
      {/* 바닥 — 충돌 처리 */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[FIELD_SIZE / 2, 0.1, FIELD_SIZE / 2]} position={[0, -0.1, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[FIELD_SIZE, FIELD_SIZE]} />
          <meshStandardMaterial color="#6b8f52" />
        </mesh>
      </RigidBody>

      {/* 경계벽 — 필드 크기와 일치 */}
      <BoundaryWallsMesh size={FIELD_SIZE} />

      <Grid
        position={[0, 0.01, 0]}
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#5a7a45"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#3d5c2e"
        fadeDistance={60}
        fadeStrength={1.5}
      />
    </>
  )
}
