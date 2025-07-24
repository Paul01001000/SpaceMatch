import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

export const useUnreadChats = (bookingIds: string[]) => {
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const [totalUnread, setTotalUnread] = useState(0);

  const checkUnreadStatus = async () => {
    if (bookingIds.length === 0) return;

    try {
      const promises = bookingIds.map(async (bookingId) => {
        const status = await chatService.getUnreadStatus(bookingId);
        return { bookingId, hasUnread: status.hasUnread, unreadCount: status.unreadCount };
      });

      const results = await Promise.all(promises);
      const newUnreadChats = new Set<string>();
      let total = 0;

      results.forEach(({ bookingId, hasUnread, unreadCount }) => {
        if (hasUnread) {
          newUnreadChats.add(bookingId);
          total += unreadCount;
        }
      });

      setUnreadChats(newUnreadChats);
      setTotalUnread(total);
    } catch (error) {
      console.error('Error checking unread status for multiple chats:', error);
    }
  };

  useEffect(() => {
    checkUnreadStatus();
    // Check every 30 seconds
    const interval = setInterval(checkUnreadStatus, 30000);
    return () => clearInterval(interval);
  }, [bookingIds]);

  return { unreadChats, totalUnread, hasAnyUnread: unreadChats.size > 0 };
};
