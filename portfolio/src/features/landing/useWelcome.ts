'use client'

import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

export function useWelcome() {
  const { progress } = useProgress()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (progress < 100) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [progress])

  return { visible }
}
