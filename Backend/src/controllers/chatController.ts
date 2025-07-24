import { Request, Response } from 'express';
import { Chat } from '../models/Chat';
import { Booking, User, Space } from '../models';
import { AuthenticatedRequest } from './auth';

// Create or get chat for a booking
export const getChatForBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Verify the booking exists and user is involved
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Get space provider ID
    const space = await Space.findById(booking.spaceId);
    if (!space) {
      res.status(404).json({ message: 'Space not found' });
      return;
    }

    // Check if user is either the booker or space provider
    if (booking.userId.toString() !== currentUserId && space.providerId !== currentUserId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Find or create chat
    let chat = await Chat.findOne({ bookingId });
    
    if (!chat) {
      chat = new Chat({
        bookingId,
        participants: [booking.userId.toString(), space.providerId],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await chat.save();
    }

    // Get participant names
    const participantUsers = await User.find({
      _id: { $in: chat.participants }
    }).select('firstName lastName email');

    const participantNames = participantUsers.reduce((acc: Record<string, string>, user: any) => {
      acc[user._id.toString()] = `${user.firstName} ${user.lastName}`;
      return acc;
    }, {} as Record<string, string>);

    res.json({
      success: true,
      data: {
        ...chat.toObject(),
        participantNames
      }
    });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message
export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { message } = req.body;
    const currentUserId = req.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!message || message.trim().length === 0) {
      res.status(400).json({ message: 'Message cannot be empty' });
      return;
    }

    const chat = await Chat.findOne({ bookingId });
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Verify user is a participant
    if (!chat.participants.includes(currentUserId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Add message
    const newMessage = {
      senderId: currentUserId,
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const chat = await Chat.findOne({ bookingId });
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Verify user is a participant
    if (!chat.participants.includes(currentUserId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Mark messages from other participants as read
    let hasUpdates = false;
    chat.messages.forEach(message => {
      if (message.senderId !== currentUserId && !message.isRead) {
        message.isRead = true;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await chat.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get chat messages with pagination
export const getChatMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const chat = await Chat.findOne({ bookingId });
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Verify user is a participant
    if (!chat.participants.includes(currentUserId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get messages with pagination (latest first)
    const messages = chat.messages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(skip, skip + limitNum)
      .reverse(); // Reverse to show chronological order

    res.json({
      success: true,
      data: {
        messages,
        hasMore: chat.messages.length > skip + limitNum,
        total: chat.messages.length
      }
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread message status for a booking
export const getUnreadStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const chat = await Chat.findOne({ bookingId });
    if (!chat) {
      res.json({
        success: true,
        data: { hasUnread: false, unreadCount: 0 }
      });
      return;
    }

    // Check if user is participant
    if (!chat.participants.includes(currentUserId)) {
      res.status(403).json({ message: 'Not authorized to access this chat' });
      return;
    }

    // Count unread messages for this user
    const unreadMessages = chat.messages.filter(msg => 
      msg.senderId !== currentUserId && !msg.isRead
    );

    res.json({
      success: true,
      data: {
        hasUnread: unreadMessages.length > 0,
        unreadCount: unreadMessages.length
      }
    });
  } catch (error) {
    console.error('Error getting unread status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
