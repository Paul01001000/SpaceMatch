import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

interface ChatButtonProps {
  bookingId: string;
  onOpenChat: (bookingId: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ChatButton: React.FC<ChatButtonProps> = ({
  bookingId,
  onOpenChat,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 relative';
  
  const variantClasses = {
    primary: 'bg-red-700 hover:bg-red-800 text-white focus:ring-red-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-red-700 text-red-700 hover:bg-red-50 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const checkUnreadStatus = async () => {
    try {
      const status = await chatService.getUnreadStatus(bookingId);
      setHasUnread(status.hasUnread);
      setUnreadCount(status.unreadCount);
    } catch (error) {
      console.error('Error checking unread status:', error);
    }
  };

  useEffect(() => {
    checkUnreadStatus();
    // Check for unread messages every 30 seconds
    const interval = setInterval(checkUnreadStatus, 30000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const handleClick = () => {
    onOpenChat(bookingId);
    // Mark as read when chat is opened
    if (hasUnread) {
      chatService.markAsRead(bookingId);
      setHasUnread(false);
      setUnreadCount(0);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      type="button"
    >
      <svg
        className={`${iconSizes[size]} mr-2`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Open Chat
      
      {/* Unread indicator */}
      {hasUnread && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
