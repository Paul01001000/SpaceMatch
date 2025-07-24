import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { reservationService } from '../services/reservationService';
import { spaceService } from '../services/spaceService';
import { Booking } from '../types/Booking';
import { Space } from '../types/Space';
import FutureBookings from './FutureBookings';
import PastBookings from './PastBookings';
import { useUnreadChats } from '../hooks/useUnreadChats';

interface MyBookingsProps {
  onOpenChat?: (bookingId: string) => void;
  onPaymentContinue: (booking: Booking) => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ onOpenChat, onPaymentContinue }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spaces, setSpaces] = useState<{ [spaceId: string]: Space }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      reservationService.getReservationsByUserId(user.id)
        .then(async (res) => {
          setBookings(res);
          const uniqueSpaceIds = Array.from(new Set(res.map(b => b.spaceId)));
          const spaceResults = await Promise.all(uniqueSpaceIds.map(id => spaceService.getSpaceById(id)));
          const spaceMap: { [spaceId: string]: Space } = {};
          spaceResults.forEach(space => { if (space._id) spaceMap[space._id] = space; });
          setSpaces(spaceMap);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const now = new Date();
  const pastBookings = bookings.filter(b => new Date(b.endTime) < now);
  const futureBookings = bookings.filter(b => new Date(b.endTime) >= now);

  // Get unread status for all bookings
  const allBookingIds = bookings.map(b => b._id).filter(Boolean);
  const futureBookingIds = futureBookings.map(b => b._id).filter(Boolean);
  const pastBookingIds = pastBookings.map(b => b._id).filter(Boolean);
  
  const { hasAnyUnread: hasAnyUnreadFuture } = useUnreadChats(futureBookingIds);
  const { hasAnyUnread: hasAnyUnreadPast } = useUnreadChats(pastBookingIds);

  return (
    <div className="p-4 w-full">
      <h2 className="text-2xl font-bold mb-4 text-left ml-0 mt-2">My Bookings</h2>
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <FutureBookings bookings={futureBookings} spaces={spaces} onOpenChat={onOpenChat} hasUnreadIndicator={hasAnyUnreadFuture} onPaymentContinue={onPaymentContinue}/>
          </div>
          <div className="my-6" />
          <div className="relative">
            <PastBookings bookings={pastBookings} spaces={spaces} onOpenChat={onOpenChat} hasUnreadIndicator={hasAnyUnreadPast} />
          </div>
        </>
      )}
    </div>
  );
};

export default MyBookings;
