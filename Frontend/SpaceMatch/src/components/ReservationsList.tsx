import { useEffect, useState } from 'react';
import { reservationService } from '../services/reservationService';
import { spaceService } from '../services/spaceService';
import SpaceReservation from './SpaceReservation';
import { Space } from '../types/Space';
import { Booking } from '../types/Booking';

interface ReservationsListProps {
  onOpenChat?: (bookingId: string) => void;
}

const ReservationsList = ({ onOpenChat }: ReservationsListProps) => {
  const [spaceReservations, setSpaceReservations] = useState<{ space: Space; reservations: Booking[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        const spaces = await spaceService.getMySpaces();
        const reservationsBySpace = await Promise.all(
          spaces.map(async (space) => {
            const reservations = await reservationService.getReservationsBySpaceId(space._id);
            return { space, reservations };
          })
        );
        setSpaceReservations(reservationsBySpace);
      } catch (e: any) {
        setError(e.message || 'Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reservations...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-red-500">{error}</div>;

  if (!spaceReservations.length) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-8 text-center text-gray-600">
          <div className="text-2xl mb-2">No reservations yet</div>
          <div className="text-base">You have no spaces or no reservations for your spaces yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-8">
        {spaceReservations.map(({ space, reservations }) => (
          <div key={space._id} className="border-1 border-black rounded-md p-0.5">
            <SpaceReservation space={space} reservations={reservations} onOpenChat={onOpenChat} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationsList;
