import { Booking } from '../types/Booking';
import ChatButton from './ChatButton';

interface ReservationCardProps {
  reservation: Booking;
  onOpenChat?: (bookingId: string) => void;
}

const ReservationCard = ({ reservation, onOpenChat }: ReservationCardProps) => {
  // Format dates
  const startDate = new Date(reservation.startTime);
  const endDate = new Date(reservation.endTime);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Determine if reservation is upcoming, ongoing, or past
  const now = new Date();
  const getStatus = () => {
    if (now < startDate) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: '📅' };
    if (now >= startDate && now <= endDate) return { label: 'Active', color: 'bg-green-100 text-green-800', icon: '🟢' };
    return { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: '✅' };
  };

  const status = getStatus();
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-red-200 group">
      {/* Header with user and status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
            {(reservation.bookingUserName || 'Unknown').charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 group-hover:text-red-700 transition-colors">
              {reservation.bookingUserName || 'Unknown User'}
            </h4>
            <p className="text-sm text-gray-500">
              Reservation ID: {reservation._id?.slice(-8) || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} flex items-center gap-1`}>
            <span>{status.icon}</span>
            {status.label}
          </div>
          {onOpenChat && reservation._id && (
            <ChatButton
              bookingId={reservation._id}
              onOpenChat={onOpenChat}
              variant="primary"
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Date and Time Information */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕐</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Start Time</p>
              <p className="text-gray-800 font-semibold">
                {formatDate(startDate)}
              </p>
              <p className="text-gray-600 text-sm">
                {formatTime(startDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🕕</span>
            <div>
              <p className="text-sm font-medium text-gray-600">End Time</p>
              <p className="text-gray-800 font-semibold">
                {isSameDay ? formatTime(endDate) : formatDate(endDate)}
              </p>
              {!isSameDay && (
                <p className="text-gray-600 text-sm">
                  {formatTime(endDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>⏱️</span>
            <span>Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))} hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
