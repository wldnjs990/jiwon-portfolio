import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Object3D, PointLight } from 'three'
import { usePrinterInteraction, findButtonAncestor } from '../usePrinterInteraction'
import { useOnboardingPrinterInteraction } from '../useOnboardingPrinterInteraction'
import { useLandingStore } from '@/features/landing/landingStore'

interface PrinterMeshProps {
  onPrint?: () => void
}

export default function PrinterMesh({ onPrint }: PrinterMeshProps) {
  const { scene, actions, handlePrintButtonClick, handleOpenButtonClick } = usePrinterInteraction()
  const onboardingStep = useLandingStore((s) => s.onboardingStep)

  // 온보딩 전용 훅 — scene과 actions 공유
  useOnboardingPrinterInteraction(scene, actions)

  // sparkle light — ref로 직접 조작해 React 리렌더 방지
  const sparkleLightRef = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    if (!sparkleLightRef.current) return
    sparkleLightRef.current.intensity = 0.5 + Math.sin(clock.elapsedTime * 5) * 0.5
  })

  return (
    <group>
      {/* print-ready 단계 sparkle 포인트라이트 */}
      {onboardingStep === 'print-ready' && (
        <pointLight
          ref={sparkleLightRef}
          position={[0.55, 0.8, 0.55]}
          intensity={0}
          color="#ffd700"
          distance={2}
        />
      )}

      {/* GLB 모델
          Blender에서 NEMONIC_OPEN_BUTTON / NEMONIC_PRINT_BUTTON 은 Group(부모).
          실제 클릭 mesh는 자식(예: NEMONIC_OPEN_BUTTON_1_1)이므로
          ancestor 탐색으로 버튼 그룹에 속하는지 확인한다. */}
      <primitive
        object={scene}
        scale={8}
        onClick={(event: { stopPropagation: () => void; object: Object3D }) => {
          event.stopPropagation()
          if (findButtonAncestor(event.object, 'NEMONIC_PRINT_BUTTON')) {
            if (onboardingStep === 'print-ready' && onPrint) onPrint()
            handlePrintButtonClick()
          }
          if (findButtonAncestor(event.object, 'NEMONIC_OPEN_BUTTON')) {
            handleOpenButtonClick()
          }
        }}
        onPointerEnter={(event: { object: Object3D }) => {
          if (
            findButtonAncestor(event.object, 'NEMONIC_PRINT_BUTTON') ||
            findButtonAncestor(event.object, 'NEMONIC_OPEN_BUTTON')
          ) {
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'auto'
        }}
      />
    </group>
  )
}
