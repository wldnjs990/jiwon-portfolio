import { useMemo, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  MeshBasicMaterial,
  Quaternion,
  Shape,
  ShapeGeometry,
  TextureLoader,
  Vector3,
} from "three";
import type { Group, Mesh, Texture } from "three";
import { useLandingStore } from "@/features/landing/landingStore";
import { isolatedManager } from "../textureLoader";

// 프린터 본체 높이/깊이 (PrinterMesh와 동일)
const BH = 0.7;
const BD = 1.1;

// 프린터 정면 벽 외부면 중심
const ATTACH_POS = new Vector3(0, BH / 2, BD / 2 + 0.004);

// float 시 scale, attach 시 scale
const FLOAT_SCALE = 0.55;
const WALL_SCALE = 1.0;
// 카메라에서 mesh까지 HUD 거리
const HUD_DISTANCE = 1.5;

// attach 시 회전 목표 = identity
const IDENTITY_QUAT = new Quaternion();

// ── 아치 모양 좌표 (Konva DOOR_SHAPE → 3D 월드 좌표) ──────────────────────────
// DOOR_SHAPE: { cx:160, archCy:150, r:90, bottom:300 }, 캔버스 320×320
// PlaneGeometry UV 변환:
//   world_x = -0.33 + (canvas_x / 320) * 0.66
//   world_y = -0.33 + (1 - canvas_y / 320) * 0.66   ← y 축 반전
const ARCH_HW = 0.186; // 아치 반폭 (힌지 ↔ 자유단 거리)
const ARCH_CY = 0.021; // 아치 반원 중심 y
const ARCH_BOTTOM = -0.289; // 아치 하단 y

function createArchShape(): Shape {
  const s = new Shape();
  s.moveTo(-ARCH_HW, ARCH_BOTTOM);
  s.lineTo(-ARCH_HW, ARCH_CY);
  s.absarc(0, ARCH_CY, ARCH_HW, Math.PI, 0, true); // anticlockwise=true → 위쪽 아치
  s.lineTo(ARCH_HW, ARCH_BOTTOM);
  s.closePath();
  return s;
}

interface DrawingDoorMeshProps {
  shouldAttach: boolean;
  shouldOpen: boolean;
  onDoorClick: () => void;
  onDoorFullyOpen?: () => void;
}

export default function DrawingDoorMesh({
  shouldAttach,
  shouldOpen,
  onDoorClick,
  onDoorFullyOpen,
}: DrawingDoorMeshProps) {
  const onboardingStep = useLandingStore((s) => s.onboardingStep);
  const drawnImageUrl = useLandingStore((s) => s.drawnImageUrl);

  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const portalMatRef = useRef<MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<Texture | null>(null);

  // 두 개의 독립적인 애니메이션 값
  const targetScale = useRef(0); // 목표 uniform scale (0 → FLOAT_SCALE → WALL_SCALE)
  const uniformScale = useRef(0); // 현재 uniform scale
  const doorOpenProgress = useRef(0); // 문 열림 진행도 (0=닫힘, 1=완전히 열림)

  const tempVec = useRef(new Vector3());
  const fullyOpenFired = useRef(false);

  // 아치 geometry — 한 번만 생성
  const archGeometry = useMemo(() => new ShapeGeometry(createArchShape()), []);

  // drawnImageUrl 저장 즉시 프리로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!drawnImageUrl) {
        if (!cancelled) setTexture(null);
        return;
      }
      try {
        const t = await new Promise<Texture>((resolve, reject) => {
          new TextureLoader(isolatedManager).load(
            drawnImageUrl,
            resolve,
            undefined,
            reject,
          );
        });
        if (!cancelled) setTexture(t);
      } catch {
        // 텍스처 로드 실패 시 blank 유지
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [drawnImageUrl]);

  // paper-modal 진입 시 scale 시작
  useEffect(() => {
    if (onboardingStep === "paper-modal") {
      targetScale.current = FLOAT_SCALE;
    }
    if (onboardingStep !== "paper-modal" && onboardingStep !== "entering") {
      targetScale.current = 0;
    }
  }, [onboardingStep]);

  // shouldAttach 전환 시 wall scale
  useEffect(() => {
    if (shouldAttach) {
      targetScale.current = WALL_SCALE;
    }
  }, [shouldAttach]);

  // shouldOpen 전환 시 리셋
  useEffect(() => {
    if (!shouldOpen) {
      doorOpenProgress.current = 0;
      fullyOpenFired.current = false;
    }
  }, [shouldOpen]);

  useFrame(({ camera }, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    // ── 1. Uniform scale 스프링 (float → wall attach) ──
    const uDiff = targetScale.current - uniformScale.current;
    if (Math.abs(uDiff) > 0.001) {
      uniformScale.current += uDiff * Math.min(delta * 6, 1);
    }
    const u = uniformScale.current;

    // ── 2. 문 열림 진행도 스프링 ──
    if (shouldOpen) {
      const pDiff = 1 - doorOpenProgress.current;
      if (Math.abs(pDiff) > 0.001) {
        doorOpenProgress.current += pDiff * Math.min(delta * 2.5, 1);
      }
    }
    const p = doorOpenProgress.current;

    // ── 3. 현관문 애니메이션: X축 압축 + 힌지(왼쪽) 고정 ──
    // 정면 카메라에서 바라보는 현관문: 힌지(좌)를 중심으로 우측이 안으로 접힘
    // X scale: u → 0 (우측 자유단이 힌지 쪽으로 수렴)
    // X position: 0 → -ARCH_HW (메시 중심이 좌측으로 이동 → 힌지 좌측벽 고정)
    meshRef.current.scale.x = u * (1 - p);
    meshRef.current.scale.y = u;
    meshRef.current.scale.z = u;
    meshRef.current.position.x = -ARCH_HW * p;

    // ── 4. 그룹 위치/회전 (HUD 모드 vs 벽 부착 모드) ──
    if (!shouldAttach) {
      // HUD 모드: 카메라 정면 고정
      tempVec.current.set(0, 0, -HUD_DISTANCE);
      tempVec.current.applyQuaternion(camera.quaternion);
      groupRef.current.position.copy(camera.position).add(tempVec.current);
      groupRef.current.position.y += Math.sin(Date.now() * 0.001) * 0.025;
      groupRef.current.quaternion.copy(camera.quaternion);
    } else {
      // 벽 부착 모드: ATTACH_POS로 lerp, identity 회전
      groupRef.current.position.lerp(ATTACH_POS, Math.min(delta * 5, 1));
      groupRef.current.quaternion.slerp(IDENTITY_QUAT, Math.min(delta * 6, 1));
    }

    // ── 5. 포탈 opacity — 문 열림에 비례 ──
    if (portalMatRef.current) {
      portalMatRef.current.opacity = Math.min(Math.max(p * 2, 0), 1);
    }

    // ── 6. 문 완전히 열렸을 때 콜백 ──
    if (
      shouldOpen &&
      !fullyOpenFired.current &&
      doorOpenProgress.current > 0.92
    ) {
      fullyOpenFired.current = true;
      onDoorFullyOpen?.();
    }
  });

  if (onboardingStep !== "paper-modal" && onboardingStep !== "entering")
    return null;

  return (
    <group ref={groupRef}>
      {/* 아치형 포탈 — 문 뒤쪽 고정, 문이 열릴수록 서서히 나타남 */}
      {shouldAttach && (
        <mesh position={[0, 0, -0.002]}>
          <primitive object={archGeometry} attach="geometry" />
          <meshBasicMaterial
            ref={portalMatRef}
            color="black"
            transparent
            opacity={0}
          />
        </mesh>
      )}

      {/* 문 메시 — scale.x 압축으로 현관문 열림 표현 */}
      <mesh
        ref={meshRef}
        scale={0}
        onClick={!shouldAttach ? onDoorClick : undefined}
        onPointerEnter={() => {
          if (shouldAttach) return;
          document.body.style.cursor = "pointer";
          setHovered(true);
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "auto";
          setHovered(false);
        }}
      >
        <planeGeometry args={[BH - 0.04, BH - 0.04]} />
        <meshStandardMaterial
          map={texture ?? undefined}
          transparent={true}
          alphaTest={0.1}
          color={texture ? "white" : "#fff8f6"}
          roughness={0.8}
          emissive={hovered ? "#555555" : "#000000"}
          emissiveIntensity={hovered ? 0.12 : 0}
        />
      </mesh>
    </group>
  );
}
