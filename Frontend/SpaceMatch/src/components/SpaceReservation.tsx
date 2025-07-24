import ReservationCard from './ReservationCard';
import { Space } from '../types/Space';
import { Booking } from '../types/Booking';
import { useState } from 'react';

interface SpaceReservationProps {
  space: Space;
  reservations: Booking[];
  onOpenChat?: (bookingId: string) => void;
}

const SpaceReservation = ({ space, reservations, onOpenChat }: SpaceReservationProps) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const showLoadMore = reservations.length > visibleCount;

  // Sort reservations by start time (newest first)
  const sortedReservations = [...reservations].sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">{space.title}</h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {reservations.length} {reservations.length === 1 ? 'reservation' : 'reservations'}
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-lg">No reservations yet</p>
          <p className="text-sm">Your space is ready for bookings!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReservations.slice(0, visibleCount).map((reservation) => (
            <ReservationCard key={reservation._id} reservation={reservation} onOpenChat={onOpenChat} />
          ))}
        </div>
      )}

      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-3 bg-red-700 text-white rounded-full hover:bg-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => setVisibleCount((c) => c + 5)}
          >
            Load more reservations
          </button>
        </div>
      )}
    </div>
  );
};

export default SpaceReservation;
