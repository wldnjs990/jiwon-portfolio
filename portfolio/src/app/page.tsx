import WorldLoader from '@/worlds/WorldLoader'
import { WelcomeOverlay, ExploreToggle, TransitionOverlay } from '@/features/landing'
import { BookshelfModal, BackToLandingButton, InteractionHUD, MobileJoystick } from '@/features/myroom'

export default function Page() {
  return (
    <div className="relative w-full h-full">
      <WorldLoader />
      <WelcomeOverlay />
      <ExploreToggle />
      <TransitionOverlay />
      <BookshelfModal />
      <BackToLandingButton />
      <InteractionHUD />
      <MobileJoystick />
    </div>
  )
}
