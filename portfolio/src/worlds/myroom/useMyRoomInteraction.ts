import { useMyroomStore } from '@/features/myroom/myroomStore'

export function useMyRoomInteraction() {
  const setModalOpen = useMyroomStore((s) => s.setModalOpen)

  const handleBookshelfClick = () => {
    setModalOpen(true)
  }

  return { handleBookshelfClick }
}
