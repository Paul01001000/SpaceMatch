import React from "react";
import { Availability } from "../types/Availability";

interface SpaceCardProps {
  availability: Availability;
  onEdit: (availId: string) => void;
  onDelete: (availId: string) => void;
}

/**
 * Individual availability card component with minimal design
 * Shows time and price with red delete button
 */
const AvailabilityCard: React.FC<SpaceCardProps> = ({
  availability,
  onEdit,
  onDelete,
}) => {
  // Format time to show just hours and minutes
  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Format date to show day and date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString([], {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center justify-between">
        {/* Time and Date Info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {formatDate(availability.date)}
          </div>
          <div className="text-base font-medium text-gray-900">
            {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
          </div>
          <div className="text-sm text-gray-600">
            €{availability.specialPricing}/hr
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(availability._id)}
          className="px-3 py-1.5 text-sm bg-red-700 text-white rounded hover:bg-red-800 transition-colors duration-200 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AvailabilityCard;
