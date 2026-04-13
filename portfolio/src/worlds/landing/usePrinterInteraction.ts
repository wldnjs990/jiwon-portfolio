import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

// 슬릿 Y 좌표 기준
const SLOT_Y = 0.716
const PAPER_HALF_H = 0.19  // 라벨지 높이 0.38의 절반

// 완전히 숨겨진 위치: 라벨지 상단이 슬릿 아래에 있음
const HIDDEN_Y = SLOT_Y - PAPER_HALF_H - 0.01
// 출력된 위치: 라벨지의 약 65%가 슬릿 위로 올라온 상태
const EXTENDED_Y = SLOT_Y + PAPER_HALF_H * 0.65

export function usePrinterInteraction() {
  const [isPrinting, setIsPrinting] = useState(false)
  const paperRef = useRef<Mesh>(null)
  const targetY = useRef(HIDDEN_Y)
  const retractTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleButtonPress = () => {
    if (isPrinting) return
    setIsPrinting(true)

    // 이전 자동 회수 타이머 취소
    if (retractTimer.current) clearTimeout(retractTimer.current)

    // 라벨지 올라오도록 타겟 설정
    targetY.current = EXTENDED_Y

    // 2.5초 후 자동 회수
    retractTimer.current = setTimeout(() => {
      targetY.current = HIDDEN_Y
      setIsPrinting(false)
    }, 2500)
  }

  useFrame((_, delta) => {
    if (!paperRef.current) return

    // 현재 Y에서 목표 Y로 부드럽게 lerp
    const current = paperRef.current.position.y
    const diff = targetY.current - current
    if (Math.abs(diff) > 0.0001) {
      paperRef.current.position.y += diff * Math.min(delta * 5, 1)
    }
  })

  return { paperRef, isPrinting, handleButtonPress, HIDDEN_Y }
}
