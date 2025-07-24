import { Router } from 'express';
import { getChatForBooking, sendMessage, markMessagesAsRead, getChatMessages, getUnreadStatus } from '../controllers/chatController';
import { authenticateToken } from '../controllers/auth';

const router = Router();

// Get or create chat for booking
router.get('/booking/:bookingId', authenticateToken, getChatForBooking);

// Get chat messages with pagination
router.get('/booking/:bookingId/messages', authenticateToken, getChatMessages);

// Get unread message status
router.get('/booking/:bookingId/unread', authenticateToken, getUnreadStatus);

// Send message
router.post('/booking/:bookingId/message', authenticateToken, sendMessage);

// Mark messages as read
router.put('/booking/:bookingId/read', authenticateToken, markMessagesAsRead);

export default router;
