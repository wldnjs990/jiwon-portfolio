import { useState } from "react";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import PrinterMesh from "./objects/PrinterMesh";
import DrawingDoorMesh from "./objects/DrawingDoorMesh";
import GroundMesh from "./objects/GroundMesh";
import { useLandingStore } from "@/features/landing/landingStore";
import { useSceneStore } from "@/shared/store";
import { useLandingCamera } from "./useLandingCamera";
import { useLandingInteraction } from "./useLandingInteraction";
import Character from "../_infra/Character";

export default function LandingScene() {
  const isExploreMode = useLandingStore((s) => s.isExploreMode);
  const isPrinterFocused = useLandingStore((s) => s.isPrinterFocused);
  const isTransitioning = useSceneStore((s) => s.isTransitioning);
  const setOnboardingStep = useLandingStore((s) => s.setOnboardingStep);

  const { startFront, startSuck } = useLandingCamera();

  // 프린터 근접 감지
  useLandingInteraction();
  const [attachDoor, setAttachDoor] = useState(false);
  const [openDoor, setOpenDoor] = useState(false);

  const handlePrint = () => {
    setOnboardingStep("printing");
  };

  // 그림 클릭 → 카메라 정면 이동 → 문 부착 → 500ms 후 문 열림
  const handleDoorClick = () => {
    startFront(() => {
      setAttachDoor(true);
      setTimeout(() => setOpenDoor(true), 500);
    });
  };

  // 문이 충분히 열렸을 때 suck 애니메이션 시작
  const handleDoorFullyOpen = () => {
    startSuck();
  };

  return (
    <>
      {/* 카메라 — 프린터 포커스 + 체험 모드에서만 360도 회전 가능 */}
      <OrbitControls
        enabled={isPrinterFocused && isExploreMode && !isTransitioning}
        target={[0, 0.35, 0]}
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={7}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.1}
        dampingFactor={0.08}
        enableDamping
      />

      {/* 환경 조명 */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.4}
        color="#cce4ff"
      />

      {/* HDR 환경 리플렉션 */}
      <Environment preset="city" />

      {/* 바닥 그림자 — y=0.002로 GroundMesh(y=0)와 z-fighting 방지 */}
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.35}
        scale={5}
        blur={2}
        far={2}
      />

      {/* 물리 바닥 */}
      <GroundMesh />

      {/* 이동 가능한 캐릭터 — 프린터(원점)에서 3유닛 앞에 배치, 1/3 크기 */}
      {/* Y=0.7: 내부 모델 오프셋 -0.7 적용 시 발이 바닥(y=0)에 정확히 닿음 */}
      <Character initialPosition={[0, 0.7, 3]} modelScale={0.17} />

      {/* 네모닉 프린터 메시 */}
      <PrinterMesh onPrint={handlePrint} />

      {/* 드로잉 문 메시 — paper-modal 단계에서 카메라 앞에 떠오름 */}
      <DrawingDoorMesh
        shouldAttach={attachDoor}
        shouldOpen={openDoor}
        onDoorClick={handleDoorClick}
        onDoorFullyOpen={handleDoorFullyOpen}
      />
    </>
  );
}
