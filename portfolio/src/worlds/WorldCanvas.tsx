'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { LandingScene } from './landing'

export default function WorldCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [2.5, 2, 3.5], fov: 50 }}
      style={{ width: '100vw', height: '100vh' }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <LandingScene />
      </Suspense>
    </Canvas>
  )
}
