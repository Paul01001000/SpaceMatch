import { useState, useCallback } from 'react';

interface UseChatReturn {
  isOpen: boolean;
  openChat: (bookingId: string) => void;
  closeChat: () => void;
  currentBookingId: string | null;
}

export const useChat = (): UseChatReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  const openChat = useCallback((bookingId: string) => {
    setCurrentBookingId(bookingId);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setCurrentBookingId(null);
  }, []);

  return {
    isOpen,
    openChat,
    closeChat,
    currentBookingId
  };
};
