import WorldLoader from '@/worlds/WorldLoader'
import { WelcomeOverlay } from '@/features/landing'

export default function Page() {
  return (
    <div className="relative w-full h-full">
      <WorldLoader />
      <WelcomeOverlay />
    </div>
  )
}
