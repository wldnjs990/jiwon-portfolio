import WorldLoader from "@/worlds/WorldLoader";
import {
  WelcomeOverlay,
  DrawingOverlay,
  PrintReadyOverlay,
  PaperModalOverlay,
  ExploreToggle,
  TransitionOverlay,
  PrinterProximityHUD,
} from "@/features/landing";
import {
  BookshelfModal,
  BackToLandingButton,
  InteractionHUD,
  MobileJoystick,
} from "@/features/myroom";

export default function Page() {
  return (
    <div className="relative w-full h-full">
      <WorldLoader />
      <WelcomeOverlay />
      <DrawingOverlay />
      <PrintReadyOverlay />
      <PaperModalOverlay />
      <ExploreToggle />
      <PrinterProximityHUD />
      <TransitionOverlay />
      <BookshelfModal />
      <BackToLandingButton />
      <InteractionHUD />
      <MobileJoystick />
    </div>
  );
}
