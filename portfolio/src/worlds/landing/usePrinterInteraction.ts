import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'

// 뚜껑 inner group의 world Y = 0.7 기준 로컬 좌표
const SLOT_Y = 0.016
const PAPER_HALF_H = 0.19

const HIDDEN_Y = SLOT_Y - PAPER_HALF_H - 0.01    // ≈ -0.184 (슬릿 아래 완전 숨겨짐)
const EXTENDED_Y = SLOT_Y + PAPER_HALF_H * 0.65  // ≈ 0.140 (65% 올라온 상태)

const LID_OPEN_ANGLE = -Math.PI * 0.72  // 약 130° 뒤로 열림

export function usePrinterInteraction() {
  const [isPrinting, setIsPrinting] = useState(false)
  const [lidOpen, setLidOpen] = useState(false)
  const paperRef = useRef<Mesh>(null)
  const lidGroupRef = useRef<Group>(null)
  const targetY = useRef(HIDDEN_Y)
  const targetLidAngle = useRef(0)
  const retractTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toggleButtonRef = useRef<Mesh>(null)

  const handleButtonPress = () => {
    if (isPrinting || lidOpen) return
    setIsPrinting(true)

    if (retractTimer.current) clearTimeout(retractTimer.current)

    targetY.current = EXTENDED_Y

    retractTimer.current = setTimeout(() => {
      targetY.current = HIDDEN_Y
      setIsPrinting(false)
    }, 2500)
  }

  const handleLidToggle = () => {
    const next = !lidOpen
    if (next) {
      // 뚜껑 열 때: 라벨지 자동 회수
      targetY.current = HIDDEN_Y
      if (retractTimer.current) {
        clearTimeout(retractTimer.current)
        retractTimer.current = null
      }
      setIsPrinting(false)
    }
    targetLidAngle.current = next ? LID_OPEN_ANGLE : 0
    setLidOpen(next)
  }

  useFrame((_, delta) => {
    if (paperRef.current) {
      const diff = targetY.current - paperRef.current.position.y
      if (Math.abs(diff) > 0.0001) {
        paperRef.current.position.y += diff * Math.min(delta * 5, 1)
      }
    }

    if (lidGroupRef.current) {
      const diff = targetLidAngle.current - lidGroupRef.current.rotation.x
      if (Math.abs(diff) > 0.0001) {
        lidGroupRef.current.rotation.x += diff * Math.min(delta * 4, 1)
      }
    }

    if(toggleButtonRef.current) {
      if(lidOpen && toggleButtonRef.current.position.y > -0.04) {
        toggleButtonRef.current.position.y -= 0.01
      } else if(!lidOpen && toggleButtonRef.current.position.y < 0.04) {
        toggleButtonRef.current.position.y += 0.01
      }
    }
  })

  return { paperRef, lidGroupRef, isPrinting, lidOpen, handleButtonPress, handleLidToggle, HIDDEN_Y, toggleButtonRef }
}
