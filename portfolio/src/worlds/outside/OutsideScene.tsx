import { Sky } from '@react-three/drei'
import { Character, Lighting } from '../_infra'
import GroundMesh from './GroundMesh'

export default function OutsideScene() {
  return (
    <>
      <Lighting />
      <Sky sunPosition={[100, 20, 100]} />
      <fog attach="fog" args={['#c9e8f5', 40, 100]} />
      <GroundMesh />
      <Character />
    </>
  )
}
