import React from 'react';
import { Booking } from '../types/Booking';
import { Space } from '../types/Space';

interface BookingCardProps {
  booking: Booking;
  space: Space;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, space }) => {
  // Format address
  const address = `${space.street} ${space.houseNumber}, ${space.postalCode} ${space.country}`;
  // Use first image or a placeholder
  const image = space.images && space.images.length > 0 ? space.images[0] : 'https://via.placeholder.com/150';
  // Placeholder for rating (if you have a rating system, replace this)
  const rating = space.rating || 'N/A';

  return (
    <div className="flex gap-4 p-4 border rounded-lg shadow mb-4 bg-white">
      <img src={image} alt={space.title} className="w-24 h-24 object-cover rounded" />
      <div className="flex-1">
        <h3 className="text-lg font-bold">{space.title}</h3>
        <p className="text-sm text-gray-600">{address}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm">{rating}</span>
        </div>
        <div className="mt-2">
          <span className="text-xs font-semibold">Status:</span> <span className="text-xs">{booking.status}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;

