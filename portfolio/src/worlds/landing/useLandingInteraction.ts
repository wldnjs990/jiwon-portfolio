import { useFrame } from "@react-three/fiber";
import { characterPosRef } from "@/shared/stores";
import { useLandingStore } from "@/features/landing/landingStore";

const PRINTER_NEAR_THRESHOLD = 3.0; // 프린터 근접 임계값 (world units)

export function useLandingInteraction() {
  useFrame(() => {
    // 프린터는 원점(0,0,0)에 위치 — XZ 거리만 계산
    const distanceToPrinter = Math.sqrt(
      characterPosRef.x ** 2 + characterPosRef.z ** 2,
    );
    const nowNear = distanceToPrinter < PRINTER_NEAR_THRESHOLD;

    // 값이 바뀔 때만 store 업데이트 (60fps setStore 방지)
    const { isNearPrinter, setNearPrinter } = useLandingStore.getState();
    if (nowNear !== isNearPrinter) {
      setNearPrinter(nowNear);
    }
  });
}
