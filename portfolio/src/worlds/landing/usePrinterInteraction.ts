import { useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { LoopOnce } from 'three'
import type { AnimationAction, Object3D } from 'three'

/**
 * GLB 기반 프린터 인터랙션 훅.
 *
 * GLB export 시 NLA 트랙이 오브젝트 단위 clip으로 분리됨:
 *   print_action  → ['print_button_click', 'label_up']
 *   print_head_open → ['toggle_side_button', 'print_head_up']
 *
 * 코드에서 그룹을 정의해 동시 재생함.
 */

// NLA 트랙 → 실제 GLB clip 이름 그룹 매핑
const PRINT_ACTION_CLIPS = ['print_button_click', 'label_up'] as const
const OPEN_HEAD_CLIPS = ['toggle_side_button', 'print_head_up'] as const

/** 클릭된 mesh에서 조상을 타고 올라가며 해당 버튼 그룹명을 찾는다 */
export function findButtonAncestor(object: Object3D, buttonName: string): boolean {
  let current: Object3D | null = object
  while (current) {
    if (current.name === buttonName) return true
    current = current.parent
  }
  return false
}

function playOnce(action: AnimationAction, reverse = false) {
  action.reset().setLoop(LoopOnce, 1)
  action.clampWhenFinished = true
  if (reverse) {
    action.timeScale = -1
    action.time = action.getClip().duration
  } else {
    action.timeScale = 1
  }
  action.play()
}

export function usePrinterInteraction() {
  const { scene, animations } = useGLTF('/nemonic-custom.glb')
  const { actions } = useAnimations(animations, scene)
  const [lidOpen, setLidOpen] = useState(false)

  const handlePrintButtonClick = () => {
    PRINT_ACTION_CLIPS.forEach((clipName) => {
      const action = actions[clipName]
      if (action) playOnce(action)
    })
  }

  const handleOpenButtonClick = () => {
    OPEN_HEAD_CLIPS.forEach((clipName) => {
      const action = actions[clipName]
      if (action) playOnce(action, lidOpen)
    })
    setLidOpen((prev) => !prev)
  }

  return { scene, actions, handlePrintButtonClick, handleOpenButtonClick }
}

useGLTF.preload('/nemonic-custom.glb')
