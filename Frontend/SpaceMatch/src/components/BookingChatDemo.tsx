import React from 'react';
import ChatButton from './ChatButton';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';

interface BookingChatDemoProps {
  bookingId: string;
  spaceName: string;
  providerName: string;
}

const BookingChatDemo: React.FC<BookingChatDemoProps> = ({
  bookingId,
  spaceName,
  providerName
}) => {
  const { user } = useAuth();
  const { openChat } = useChat();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Booking Communication
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{spaceName}</h4>
            <p className="text-sm text-gray-600">Provider: {providerName}</p>
          </div>
          
          <ChatButton
            bookingId={bookingId}
            onOpenChat={openChat}
            variant="primary"
            size="md"
          />
        </div>
        
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          <p className="mb-2">
            💬 <strong>Chat is available</strong> for this booking
          </p>
          <ul className="space-y-1 text-xs">
            <li>• Send messages to communicate with the space provider</li>
            <li>• Messages are stored securely and available anytime</li>
            <li>• Real-time updates keep conversations current</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingChatDemo;
