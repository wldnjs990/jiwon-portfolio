'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import { OutsideScene } from './outside'

export default function WorldCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 10], fov: 60 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          <OutsideScene />
        </Physics>
      </Suspense>
    </Canvas>
  )
}
