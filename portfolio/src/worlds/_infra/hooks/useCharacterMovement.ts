import { RefObject, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const MOVE_SPEED = 4
const DASH_SPEED = 8
const ROTATION_LERP = 12
const CAMERA_OFFSET = new THREE.Vector3(0, 15, 12)
const CAMERA_LERP = 0.06
const GRAVITY = -20

/**
 * KinematicCharacterController를 사용해 WASD 이동을 처리합니다.
 * - computeColliderMovement: 충돌을 고려한 보정 이동량을 계산 (벽·바닥 관통 방지)
 * - 중력을 직접 누적해 Controller가 바닥 충돌로 해소
 * - 카메라는 RigidBody translation을 기준으로 lerp 추적
 */
export function useCharacterMovement(
  rbRef: RefObject<RapierRigidBody>,
  groupRef: RefObject<THREE.Group>,
  isMovingRef: { current: boolean },
) {
  const keys = useRef<Set<string>>(new Set())
  const cameraDesired = useRef(new THREE.Vector3())
  const lookAtCurrent = useRef(new THREE.Vector3(0, 1, 0))
  const lookAtTarget = useRef(new THREE.Vector3())
  const verticalVelocity = useRef(0)
  const { camera } = useThree()
  const { world } = useRapier()
  const controllerRef = useRef<ReturnType<typeof world.createCharacterController> | null>(null)

  // KinematicCharacterController 초기화 — 충돌 보정 + 스냅
  useEffect(() => {
    const controller = world.createCharacterController(0.01)
    controller.setUp({ x: 0, y: 1, z: 0 })
    controller.setMaxSlopeClimbAngle(45 * (Math.PI / 180))
    controller.setMinSlopeSlideAngle(30 * (Math.PI / 180))
    controller.enableAutostep(0.3, 0.1, true)
    controller.enableSnapToGround(0.3)
    controllerRef.current = controller

    return () => {
      world.removeCharacterController(controller)
    }
  }, [world])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.key)
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!rbRef.current || !groupRef.current || !controllerRef.current) return

    const pressed = keys.current
    let dx = 0
    let dz = 0

    const moveSpeed = pressed.has('Shift') ? DASH_SPEED : MOVE_SPEED

    if (pressed.has('ArrowUp') || pressed.has('w') || pressed.has('W')) dz -= 1
    if (pressed.has('ArrowDown') || pressed.has('s') || pressed.has('S')) dz += 1
    if (pressed.has('ArrowLeft') || pressed.has('a') || pressed.has('A')) dx -= 1
    if (pressed.has('ArrowRight') || pressed.has('d') || pressed.has('D')) dx += 1

    const moving = dx !== 0 || dz !== 0
    isMovingRef.current = moving

    if (moving) {
      const len = Math.sqrt(dx * dx + dz * dz)
      dx = (dx / len) * moveSpeed * delta
      dz = (dz / len) * moveSpeed * delta

      // 이동 방향으로 비주얼 그룹 회전
      const targetAngle = Math.atan2(dx, dz)
      let diff = targetAngle - groupRef.current.rotation.y
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      groupRef.current.rotation.y += diff * Math.min(ROTATION_LERP * delta, 1)
    }

    // 중력 누적
    verticalVelocity.current += GRAVITY * delta

    // Controller가 충돌을 고려해 실제 이동 가능한 벡터를 계산
    const desiredMovement = { x: dx, y: verticalVelocity.current * delta, z: dz }
    const collider = rbRef.current.collider(0)
    controllerRef.current.computeColliderMovement(collider, desiredMovement)
    const corrected = controllerRef.current.computedMovement()

    // 바닥에 닿으면 수직 속도 리셋
    if (controllerRef.current.computedGrounded()) {
      verticalVelocity.current = 0
    }

    // 보정된 이동량으로 RigidBody 위치 갱신
    const pos = rbRef.current.translation()
    rbRef.current.setNextKinematicTranslation({
      x: pos.x + corrected.x,
      y: pos.y + corrected.y,
      z: pos.z + corrected.z,
    })

    // 카메라 추적
    cameraDesired.current.set(
      pos.x + CAMERA_OFFSET.x,
      pos.y + CAMERA_OFFSET.y,
      pos.z + CAMERA_OFFSET.z,
    )
    camera.position.lerp(cameraDesired.current, CAMERA_LERP)

    lookAtTarget.current.set(pos.x, pos.y + 1.0, pos.z)
    lookAtCurrent.current.lerp(lookAtTarget.current, 0.1)
    camera.lookAt(lookAtCurrent.current)
  })
}
