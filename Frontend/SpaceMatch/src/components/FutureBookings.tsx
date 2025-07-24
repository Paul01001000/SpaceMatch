import React from 'react';
import BookingRow from './BookingRow';
import { Booking } from '../types/Booking';
import { Space } from '../types/Space';

interface FutureBookingsProps {
  bookings: Booking[];
  spaces: { [spaceId: string]: Space };
  onOpenChat?: (bookingId: string) => void;
  hasUnreadIndicator?: boolean;
  onPaymentContinue: (booking: Booking) => void;
}

const FutureBookings: React.FC<FutureBookingsProps> = ({ bookings, spaces, onOpenChat, hasUnreadIndicator , onPaymentContinue}) => {
  if (bookings.length === 0) return <div className="text-gray-500 text-sm">No future bookings.</div>;
  return (
    <div>
      <h3 className="font-semibold mb-2 relative inline-flex items-center">
        Future Bookings
        {hasUnreadIndicator && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            !
          </span>
        )}
      </h3>
      <div className="divide-y">
        {bookings.map(b => spaces[b.spaceId] && (
          <BookingRow key={b._id} booking={b} space={spaces[b.spaceId]} onOpenChat={onOpenChat} onPaymentContinue={onPaymentContinue} />
        ))}
      </div>
    </div>
  );
};

export default FutureBookings;

