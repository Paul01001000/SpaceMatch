import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
  senderId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatData {
  _id: string;
  bookingId: string;
  participants: string[];
  messages: Message[];
  participantNames: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatProps {
  bookingId: string;
  currentUserId: string;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ bookingId, currentUserId, onClose }) => {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (isInitialized) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Initializing chat for booking:', bookingId);
      const response = await fetch(`/api/chat/booking/${bookingId}`, {
        headers: getAuthHeaders(),
      });
      
      console.log('Chat API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat API error:', errorText);
        throw new Error('Failed to load chat');
      }
      
      const data = await response.json();
      console.log('Chat data received:', data);
      
      if (data.success) {
        setChatData(data.data);
        setMessages(data.data.messages || []);
        lastMessageCountRef.current = data.data.messages?.length || 0;
        setIsInitialized(true);
        
        // Mark messages as read
        markMessagesAsRead();
      }
    } catch (err) {
      console.error('Chat initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, isInitialized]);

  // Poll for new messages
  const pollForMessages = useCallback(async () => {
    if (!chatData || !isInitialized) return;
    
    try {
      const response = await fetch(`/api/chat/booking/${bookingId}/messages`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.success && data.data.messages) {
        const newMessages = data.data.messages;
        
        // Only update if message count changed
        if (newMessages.length !== lastMessageCountRef.current) {
          setMessages(newMessages);
          lastMessageCountRef.current = newMessages.length;
          
          // Mark new messages as read
          markMessagesAsRead();
          
          // Auto-scroll to bottom for new messages
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (err) {
      console.error('Error polling for messages:', err);
    }
  }, [bookingId, chatData, isInitialized]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!chatData) return;
    
    try {
      await fetch(`/api/chat/booking/${bookingId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [bookingId, chatData]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/chat/booking/${bookingId}/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        // Message will be picked up by polling
        setTimeout(pollForMessages, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Set up polling for new messages
  useEffect(() => {
    if (isInitialized && chatData) {
      pollIntervalRef.current = setInterval(pollForMessages, 2000); // Poll every 2 seconds
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isInitialized, chatData, pollForMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  // Format timestamp
  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Get other participant name
  const getOtherParticipantName = () => {
    if (!chatData) return 'Chat';
    
    const otherParticipant = chatData.participants.find(p => p !== currentUserId);
    return otherParticipant ? chatData.participantNames[otherParticipant] || 'User' : 'Chat';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-700"></div>
            <span>Loading chat...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            💬 Chat with {getOtherParticipantName()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === currentUserId
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUserId ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isSending}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                newMessage.trim() && !isSending
                  ? 'bg-red-700 hover:bg-red-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
