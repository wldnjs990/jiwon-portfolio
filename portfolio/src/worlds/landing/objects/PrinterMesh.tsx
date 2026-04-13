import { useMemo, useState } from 'react'
import { Shape } from 'three'
import { usePrinterInteraction } from '../usePrinterInteraction'

const BUTTON_SIZE = 0.13

export default function PrinterMesh() {
  const { paperRef, isPrinting, handleButtonPress, HIDDEN_Y } = usePrinterInteraction()
  const [buttonHovered, setButtonHovered] = useState(false)

  // 직각삼각형 Shape — XY 평면 정의 후 mesh에서 -π/2 회전으로 XZ 평면(수평)에 눕힘
  // (0,0): 직각 꼭짓점 = 그룹 원점 (프린터 모서리)
  // (-SIZE, 0): -X 방향 (프린터 중앙쪽)
  // (0, SIZE): +Y → 회전 후 -Z 방향 (프린터 중앙쪽)
  const buttonShape = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(0, 0)
    shape.lineTo(-BUTTON_SIZE, 0)
    shape.lineTo(0, BUTTON_SIZE)
    shape.closePath()
    return shape
  }, [])

  return (
    <group position={[0, 0, 0]}>
      {/* 본체 */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.7, 1.1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* 상판 — 약간 다른 흰색 */}
      <mesh position={[0, 0.705, 0]} receiveShadow>
        <boxGeometry args={[1.1, 0.01, 1.1]} />
        <meshStandardMaterial color="#ececec" roughness={0.4} />
      </mesh>

      {/* 슬릿 + 라벨지 그룹 — X=0, Z=0.1 공통 관리 */}
      <group position={[0, 0, 0.3]}>
        {/* 상판 프린트 슬릿 (출구) */}
        <mesh position={[0, 0.716, 0]}>
          <boxGeometry args={[0.84, 0, 0.06]} />
          <meshStandardMaterial color="#333333" roughness={0.8} />
        </mesh>

        {/* 라벨지 — 세로 정사각형, 슬릿에서 위로 올라오는 애니메이션
            초기 위치: 프린터 내부에 완전히 숨겨진 상태 */}
        <mesh ref={paperRef} position={[0, HIDDEN_Y, 0]}>
          <boxGeometry args={[0.80, 0.38, 0.003]} />
          <meshStandardMaterial color="#fff8f6" roughness={0.85} />
        </mesh>
      </group>

      {/* 버튼 그룹 — 공통 position을 그룹에서 관리, 자식은 그룹 원점 기준 상대 좌표 */}
      <group
        position={[0.55, 0.703, 0.55]}
        onClick={handleButtonPress}
        onPointerEnter={() => {
          document.body.style.cursor = 'pointer'
          setButtonHovered(true)
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'auto'
          setButtonHovered(false)
        }}
      >
        {/* 직각삼각형 버튼 — ExtrudeGeometry로 두께 부여
            로컬 Z축(depth 방향)이 rotation 후 월드 +Y가 되므로 위쪽으로 솟아오름 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <extrudeGeometry args={[buttonShape, { depth: 0.008, bevelEnabled: false }]} />
          <meshStandardMaterial
            color={buttonHovered ? '#cccccc' : '#dddddd'}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* 삼각형 인디케이터 — 직각삼각형 무게중심(-SIZE/3, 0, -SIZE/3)에 위치 */}
        <mesh position={[-BUTTON_SIZE / 3, 0.015, -BUTTON_SIZE / 3]}>
          <coneGeometry args={[0.018, 0.014, 3]} />
          <meshStandardMaterial color={isPrinting ? '#888888' : '#aaaaaa'} roughness={0.5} />
        </mesh>
      </group>

      {/* 하단 받침 */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[1.14, 0.03, 1.14]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
      </mesh>
    </group>
  )
}
