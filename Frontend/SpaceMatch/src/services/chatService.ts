import { authHeaders } from '../utils/auth';

export interface UnreadStatus {
  hasUnread: boolean;
  unreadCount: number;
}

class ChatService {
  private baseUrl = '/api/chat';

  async getUnreadStatus(bookingId: string): Promise<UnreadStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/booking/${bookingId}/unread`, {
        headers: authHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread status');
      }
      
      const data = await response.json();
      return data.success ? data.data : { hasUnread: false, unreadCount: 0 };
    } catch (error) {
      console.error('Error fetching unread status:', error);
      return { hasUnread: false, unreadCount: 0 };
    }
  }

  async markAsRead(bookingId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/booking/${bookingId}/read`, {
        method: 'PUT',
        headers: authHeaders(),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}

export const chatService = new ChatService();
