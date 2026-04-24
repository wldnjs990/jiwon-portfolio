import { RigidBody } from "@react-three/rapier";

export default function GroundMesh() {
  return (
    <RigidBody type="fixed" friction={1} restitution={0}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#21DB75" roughness={1} />
      </mesh>
    </RigidBody>
  );
}
