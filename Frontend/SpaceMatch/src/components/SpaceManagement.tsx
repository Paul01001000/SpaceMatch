import React, { use } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AvailabilityList from "./AvailabilityList";
import AddTimeSlot from "./AddTimeSlot";
import { useAvailabilities } from "../hooks/useAvailabilities";

interface SpaceManagementProps {
    onCancel?: () => void;
  }
const SpaceManagement: React.FC<SpaceManagementProps> = ({
    onCancel,
  }) => {
    const spaceId = useParams().id; // Get spaceId from URL parameters
    const { availabilities, loading, error, deleteAvailability, refreshAvailabilities } = useAvailabilities(spaceId);
    
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Space Details Form */}
          <div className="w-full md:w-1/2">
            <AddTimeSlot
                spaceId={spaceId}
                onSave={refreshAvailabilities}
                onCancel={onCancel}/>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block border-l border-gray-300"></div>

          {/* Right side: Availability Management */}
          <div className="w-full md:w-1/2">
            <AvailabilityList
                availabilities={availabilities}
                loading={loading}
                error={error}
                deleteAvailability={deleteAvailability}
                refreshAvailabilities={refreshAvailabilities}/>
          </div>
        </div>
      </div>
    );
};

export default SpaceManagement;