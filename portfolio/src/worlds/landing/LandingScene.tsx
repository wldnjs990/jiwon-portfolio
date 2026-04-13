import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import PrinterMesh from './objects/PrinterMesh'

export default function LandingScene() {
  return (
    <>
      {/* 카메라 — 프린터 중심을 바라보며 360도 회전 가능 */}
      <OrbitControls
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
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#cce4ff" />

      {/* HDR 환경 리플렉션 */}
      <Environment preset="city" />

      {/* 바닥 그림자 */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={5}
        blur={2}
        far={2}
      />

      {/* 네모닉 프린터 메시 */}
      <PrinterMesh />
    </>
  )
}
