import { RigidBody } from "@react-three/rapier";
import { clickTargetRef } from "@/shared/stores";
import { useLandingStore } from "@/features/landing";

export default function GroundMesh() {
  const isExploreMode = useLandingStore((s) => s.isExploreMode);
  return (
    <RigidBody type="fixed" friction={1} restitution={0}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={(event) => {
          if (isExploreMode) return;
          clickTargetRef.x = event.point.x;
          clickTargetRef.z = event.point.z;
          clickTargetRef.active = true;
        }}
        onPointerMove={(event) => {
          if (isExploreMode) return;
          if (!clickTargetRef.active) return;
          clickTargetRef.x = event.point.x;
          clickTargetRef.z = event.point.z;
        }}
        onPointerUp={() => {
          if (isExploreMode) return;
          clickTargetRef.active = false;
        }}
        onPointerCancel={() => {
          if (isExploreMode) return;
          clickTargetRef.active = false;
        }}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#21DB75" roughness={1} />
      </mesh>
    </RigidBody>
  );
}
