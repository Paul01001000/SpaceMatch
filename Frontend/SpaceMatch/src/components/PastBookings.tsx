import React from 'react';
import BookingRow from './BookingRow';
import { Booking } from '../types/Booking';
import { Space } from '../types/Space';

interface PastBookingsProps {
  bookings: Booking[];
  spaces: { [spaceId: string]: Space };
  onOpenChat?: (bookingId: string) => void;
  hasUnreadIndicator?: boolean;
}

const PastBookings: React.FC<PastBookingsProps> = ({ bookings, spaces, onOpenChat, hasUnreadIndicator }) => {
  if (bookings.length === 0) return <div className="text-gray-500 text-sm">No past bookings.</div>;
  return (
    <div>
      <h3 className="font-semibold mb-2 relative inline-flex items-center">
        Past Bookings
        {hasUnreadIndicator && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            !
          </span>
        )}
      </h3>
      <div>
        {bookings.map(b => spaces[b.spaceId] && (
          <BookingRow key={b._id} booking={b} space={spaces[b.spaceId]} isPast={true} onOpenChat={onOpenChat} />
        ))}
      </div>
    </div>
  );
};

export default PastBookings;
