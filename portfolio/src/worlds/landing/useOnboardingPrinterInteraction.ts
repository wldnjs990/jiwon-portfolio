import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import type { Mesh, MeshStandardMaterial, Texture } from "three";
import { useLandingStore } from "@/features/landing/landingStore";
import { isolatedManager } from "./textureLoader";

const SLOT_Y = 0.016;
const PAPER_HALF_H = 0.19;
export const FULL_EXTENDED_Y = SLOT_Y + PAPER_HALF_H * 1.1;

/**
 * 온보딩 printing 단계 전용 훅.
 * paperRef / setTargetY 는 usePrinterInteraction 에서 받는다.
 */
export function useOnboardingPrinterInteraction(
  paperRef: React.RefObject<Mesh | null>,
  setTargetY: (y: number) => void,
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
    if (!paperRef.current) return;

    triggered.current = true;

    const applyAndAnimate = (texture: Texture | null) => {
      if (!paperRef.current) return;

      if (texture) {
        const mat = paperRef.current.material as MeshStandardMaterial;
        mat.map = texture;
        mat.needsUpdate = true;
      }

      setTargetY(FULL_EXTENDED_Y);
      checkingCompletion.current = true;
    };

    if (preloadedTexture.current) {
      // 프리로드 완료 → 동기 적용
      applyAndAnimate(preloadedTexture.current);
    } else if (drawnImageUrl) {
      // 아직 프리로드 중 → 직접 로드 후 적용 (폴백)
      new TextureLoader(isolatedManager).load(drawnImageUrl, (texture) => {
        preloadedTexture.current = texture;
        applyAndAnimate(texture);
      });
    } else {
      applyAndAnimate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingStep]);

  // setInterval 대신 useFrame으로 애니메이션 완료 감지
  useFrame(() => {
    if (!checkingCompletion.current) return;
    if (!paperRef.current) return;
    if (Math.abs(paperRef.current.position.y - FULL_EXTENDED_Y) < 0.01) {
      checkingCompletion.current = false;
      triggered.current = false;
      setOnboardingStep("paper-modal");
    }
  });
}
