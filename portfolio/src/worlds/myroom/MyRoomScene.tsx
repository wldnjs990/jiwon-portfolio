import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import type { PerspectiveCamera } from 'three'
import GroundMesh from './GroundMesh'
import BookshelfMesh from './objects/BookshelfMesh'
import Character from '../_infra/Character'
import { useMyRoomInteraction } from './useMyRoomInteraction'

export default function MyRoomScene() {
  const { camera } = useThree()
  const { handleBookshelfClick } = useMyRoomInteraction()

  // 아이소메트릭 카메라 설정
  useEffect(() => {
    camera.position.set(9, 9, 9)
    camera.lookAt(0, 0, 0)
    if ('fov' in camera) {
      (camera as PerspectiveCamera).fov = 45
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} color="#ffe4b0" />

      {/* 바닥 그림자 */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={12}
        blur={2}
        far={4}
      />

      {/* 방 구조 */}
      <GroundMesh />

      {/* 인터랙티브 책장 */}
      <BookshelfMesh onClick={handleBookshelfClick} />

      {/* 간단한 침대 장식 */}
      <BedDecoration />

      {/* 캐릭터 — 방 중앙에서 시작 */}
      <Character initialPosition={[0, 0.6, 0]} />
    </>
  )
}

// 침대 장식 (간단한 박스 조합)
function BedDecoration() {
  return (
    <group position={[2.5, 0, -3.5]}>
      {/* 침대 프레임 */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.4, 3.2]} />
        <meshStandardMaterial color="#6b4c2a" roughness={0.7} />
      </mesh>
      {/* 매트리스 */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.3, 3.0]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.9} />
      </mesh>
      {/* 베개 */}
      <mesh position={[0, 0.75, -1.1]} castShadow>
        <boxGeometry args={[1.4, 0.18, 0.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </mesh>
      {/* 침대 헤드보드 */}
      <mesh position={[0, 0.9, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 0.12]} />
        <meshStandardMaterial color="#5a3d1e" roughness={0.6} />
      </mesh>
    </group>
  )
}
