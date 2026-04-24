import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useLandingStore } from "@/features/landing/landingStore";
import { useSceneStore, characterPosRef } from "@/shared/stores";

// top-down 45° — 프린터 위에서 내려다보는 시점
const AIM_POS = new Vector3(0, 2.0, 2.0);
const AIM_LOOKAT = new Vector3(0, 0.35, 0);

// 프린터 정면 고정 — 문 중심(y=0.35) 기준
const FRONT_POS = new Vector3(0, 0.55, 2.5);
const FRONT_LOOKAT = new Vector3(0, 0.35, 0);

// 문 중심으로 빨려들어가는 최종 위치
const SUCK_TARGET = new Vector3(0, 0.35, 0.55);

// 팔로우 카메라 — 캐릭터 기준 고정 오프셋
const FOLLOW_OFFSET = new Vector3(0, 5, 4);
const FOLLOW_LOOKAT_Y_OFFSET = 0.5;
const FOLLOW_SMOOTH = 0.05;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

type CamPhase = "idle" | "aim" | "front" | "suck" | "follow";

export function useLandingCamera() {
  const setScene = useSceneStore((s) => s.setScene);
  const setTransitioning = useSceneStore((s) => s.setTransitioning);
  const setOnboardingStep = useLandingStore((s) => s.setOnboardingStep);
  const onboardingStep = useLandingStore((s) => s.onboardingStep);
  const isPrinterFocused = useLandingStore((s) => s.isPrinterFocused);

  const phase = useRef<CamPhase>("follow");
  const progress = useRef(0);
  const startPos = useRef(new Vector3());
  // GC-friendly: 매 프레임 new Vector3 생성 방지
  const followTargetPos = useRef(new Vector3());

  // isPrinterFocused 변경 시 카메라 페이즈 전환
  useEffect(() => {
    if (isPrinterFocused) {
      phase.current = "idle"; // OrbitControls에 카메라 제어 양도
    } else {
      phase.current = "follow"; // 캐릭터 팔로우 재개
      progress.current = 0;
    }
  }, [isPrinterFocused]);

  // camera-aim 단계가 되면 aim 페이즈 시작
  useEffect(() => {
    if (onboardingStep === "camera-aim") {
      phase.current = "aim";
      progress.current = 0;
    }
  }, [onboardingStep]);

  const startFollow = () => {
    phase.current = "follow";
  };

  const frontReadyCallback = useRef<(() => void) | null>(null);

  // onReady: front 이동 완료 시 호출. 없으면 즉시 suck 시작
  const startFront = (onReady?: () => void) => {
    phase.current = "front";
    progress.current = 0;
    frontReadyCallback.current = onReady ?? null;
  };

  const startSuck = () => {
    phase.current = "suck";
    progress.current = 0;
  };

  useFrame((state, delta) => {
    const { camera } = state;

    // follow: 캐릭터를 고정 오프셋으로 추적
    if (phase.current === "follow") {
      followTargetPos.current.set(
        characterPosRef.x + FOLLOW_OFFSET.x,
        characterPosRef.y + FOLLOW_OFFSET.y,
        characterPosRef.z + FOLLOW_OFFSET.z,
      );
      camera.position.lerp(followTargetPos.current, FOLLOW_SMOOTH);
      camera.lookAt(
        characterPosRef.x,
        characterPosRef.y + FOLLOW_LOOKAT_Y_OFFSET,
        characterPosRef.z,
      );
      return;
    }

    if (phase.current === "idle") return;

    // aim: top-down 45° 이동 → 완료 시 print-ready
    if (phase.current === "aim") {
      if (progress.current === 0) {
        startPos.current.copy(camera.position);
      }
      progress.current += delta * 0.9;
      const t = easeInOut(Math.min(progress.current, 1));
      camera.position.lerpVectors(startPos.current, AIM_POS, t);
      camera.lookAt(AIM_LOOKAT);

      if (progress.current >= 1) {
        phase.current = "idle";
        setOnboardingStep("print-ready");
      }
    }

    // front: 프린터 정면 이동 → 완료 시 suck
    if (phase.current === "front") {
      if (progress.current === 0) {
        startPos.current.copy(camera.position);
      }
      progress.current += delta * 0.8;
      const t = easeInOut(Math.min(progress.current, 1));
      camera.position.lerpVectors(startPos.current, FRONT_POS, t);
      camera.lookAt(FRONT_LOOKAT);

      if (progress.current >= 1) {
        if (frontReadyCallback.current) {
          frontReadyCallback.current();
          frontReadyCallback.current = null;
          phase.current = "idle"; // startSuck 호출 대기
        } else {
          phase.current = "suck";
          progress.current = 0;
        }
      }
    }

    // suck: 가속 lerp로 문 안으로 빨려들기 → entering
    if (phase.current === "suck") {
      progress.current += delta;
      const speed = 0.04 + progress.current * progress.current * 0.5;
      camera.position.lerp(SUCK_TARGET, Math.min(speed, 0.9));
      camera.lookAt(SUCK_TARGET);

      if (camera.position.distanceTo(SUCK_TARGET) < 0.12) {
        phase.current = "idle";
        setTransitioning(true);
        setOnboardingStep("entering");
        // 로딩 프로그래스 목 구현
        setTimeout(() => {
          setScene("myroom");
          setTransitioning(false);
          setOnboardingStep("idle");
        }, 2500);
      }
    }
  });

  return { startFront, startSuck, startFollow };
}
