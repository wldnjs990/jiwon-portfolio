import { CuboidCollider, RigidBody } from '@react-three/rapier'

interface Props {
  /** 정사각형 필드의 한 변 길이 (미터). 기본값 50. */
  size?: number
  /** 벽 높이 (미터). 기본값 10. */
  wallHeight?: number
}

/**
 * 필드 외곽을 감싸는 보이지 않는 경계벽.
 * size prop으로 필드 크기를 자유롭게 지정할 수 있습니다.
 *
 * @example
 * // 50×50 필드
 * <BoundaryWallsMesh size={50} />
 *
 * // 100×100 필드
 * <BoundaryWallsMesh size={100} />
 */
export default function BoundaryWallsMesh({ size = 50, wallHeight = 10 }: Props) {
  const half = size / 2
  const halfH = wallHeight / 2

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* 북쪽 (-z) */}
      <CuboidCollider args={[half, halfH, 0.1]} position={[0, halfH, -half]} />
      {/* 남쪽 (+z) */}
      <CuboidCollider args={[half, halfH, 0.1]} position={[0, halfH, half]} />
      {/* 서쪽 (-x) */}
      <CuboidCollider args={[0.1, halfH, half]} position={[-half, halfH, 0]} />
      {/* 동쪽 (+x) */}
      <CuboidCollider args={[0.1, halfH, half]} position={[half, halfH, 0]} />
    </RigidBody>
  )
}
