import { RigidBody } from '@react-three/rapier'
import { useState } from 'react'

interface BookshelfMeshProps {
  onClick: () => void
}

export default function BookshelfMesh({ onClick }: BookshelfMeshProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={[-4.5, 0, -4.5]}
      onClick={onClick}
      onPointerEnter={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
      onPointerLeave={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
    >
      <RigidBody type="fixed" colliders="cuboid">
        {/* 책장 본체 */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 2.2, 0.45]} />
          <meshStandardMaterial
            color={hovered ? '#a07820' : '#8b6914'}
            roughness={0.6}
          />
        </mesh>
        {/* 선반 1 */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.5, 0.06, 0.4]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.5} />
        </mesh>
        {/* 선반 2 */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[1.5, 0.06, 0.4]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.5} />
        </mesh>
        {/* 선반 3 */}
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[1.5, 0.06, 0.4]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* 책들 (장식) */}
      <mesh position={[-0.45, 0.85, 0]} castShadow>
        <boxGeometry args={[0.12, 0.28, 0.3]} />
        <meshStandardMaterial color="#e25c5c" roughness={0.7} />
      </mesh>
      <mesh position={[-0.3, 0.82, 0]} castShadow>
        <boxGeometry args={[0.1, 0.22, 0.28]} />
        <meshStandardMaterial color="#5c8fe2" roughness={0.7} />
      </mesh>
      <mesh position={[-0.18, 0.84, 0]} castShadow>
        <boxGeometry args={[0.14, 0.26, 0.3]} />
        <meshStandardMaterial color="#5ce29e" roughness={0.7} />
      </mesh>

      {/* 호버 글로우 효과 */}
      {hovered && (
        <mesh position={[0, 1.1, 0.23]}>
          <planeGeometry args={[1.6, 2.2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.08} />
        </mesh>
      )}
    </group>
  )
}
