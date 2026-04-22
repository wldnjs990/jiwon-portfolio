import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader, LoopOnce } from "three";
import type { AnimationAction, Mesh, MeshStandardMaterial, Object3D, Texture } from "three";
import { useLandingStore } from "@/features/landing/landingStore";
import { isolatedManager } from "./textureLoader";

// print_action 그룹 clip 이름 (usePrinterInteraction과 동일하게 유지)
const PRINT_ACTION_CLIPS = ['print_button_click', 'label_up'] as const

/**
 * 온보딩 printing 단계 전용 훅.
 * scene / actions 는 usePrinterInteraction 에서 받는다.
 */
export function useOnboardingPrinterInteraction(
  scene: Object3D,
  actions: Record<string, AnimationAction | null>,
) {
  const onboardingStep = useLandingStore((s) => s.onboardingStep);
  const drawnImageUrl = useLandingStore((s) => s.drawnImageUrl);
  const setOnboardingStep = useLandingStore((s) => s.setOnboardingStep);
  const triggered = useRef(false);
  const preloadedTexture = useRef<Texture | null>(null);
  const checkingCompletion = useRef(false);

  // drawnImageUrl 저장 즉시 프리로드 — printing 단계 진입 전에 텍스처 준비
  useEffect(() => {
    if (!drawnImageUrl) {
      preloadedTexture.current = null;
      return;
    }
    preloadedTexture.current = null;
    let cancelled = false;
    (async () => {
      try {
        const texture = await new Promise<Texture>((resolve, reject) => {
          new TextureLoader(isolatedManager).load(
            drawnImageUrl,
            resolve,
            undefined,
            reject,
          );
        });
        if (!cancelled) preloadedTexture.current = texture;
      } catch {
        // 텍스처 로드 실패 시 blank 유지
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [drawnImageUrl]);

  useEffect(() => {
    if (onboardingStep !== "printing") return;
    if (triggered.current) return;

    triggered.current = true;

    const applyAndAnimate = (texture: Texture | null) => {
      // GLB 내 종이 메시를 이름으로 탐색해 텍스처 적용
      const paperMesh = scene.getObjectByName("NEMONIC_CARTRIDGE_PAPER") as Mesh | null;
      if (paperMesh && texture) {
        const mat = paperMesh.material as MeshStandardMaterial;
        mat.map = texture;
        mat.needsUpdate = true;
      }

      // print_action 그룹의 모든 clip 동시 재생
      PRINT_ACTION_CLIPS.forEach((clipName) => {
        const action = actions[clipName];
        if (!action) return;
        action.reset().setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
      });

      checkingCompletion.current = true;
    };

    if (preloadedTexture.current) {
      applyAndAnimate(preloadedTexture.current);
    } else if (drawnImageUrl) {
      new TextureLoader(isolatedManager).load(drawnImageUrl, (texture) => {
        preloadedTexture.current = texture;
        applyAndAnimate(texture);
      });
    } else {
      applyAndAnimate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingStep]);

  // label_up clip 완료 감지 → paper-modal 전환 (종이가 다 나온 시점)
  useFrame(() => {
    if (!checkingCompletion.current) return;
    const action = actions["label_up"];
    if (!action) return;
    const duration = action.getClip().duration;
    if (action.time >= duration - 0.05) {
      checkingCompletion.current = false;
      triggered.current = false;
      setOnboardingStep("paper-modal");
    }
  });
}
