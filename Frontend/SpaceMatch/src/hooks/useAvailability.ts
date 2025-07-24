import { useState, useEffect } from 'react'; // Import useState and useEffect hooks
import { Availability, AvailabilityRequest } from '../types/Availability'; // Import the Space type
import { availabilityService } from '../services/availabilityService'; // Import the spaceService

// Custom hook for managing a single space
export const useAvailability = () => {
  // State for storing the space data
  const [availability, setAvailability] = useState<Availability | null>(null);
  // State for tracking loading status
  const [loading, setLoading] = useState<boolean>(false);
  // State for storing any errors
  const [error, setError] = useState<string | null>(null);

  // Function to create a new space
  const createAvailability = async (availabilityData: AvailabilityRequest) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      const newAvailability = await availabilityService.createAvailability(availabilityData); // Create the new space
      return newAvailability; // Return the new space
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create availability'); // Set the error message
      throw err; // Throw the error
    } finally {
      setLoading(false); // Set loading to false
    }
  };


  return {
    availability,
    loading,
    error,
    createAvailability,
  };
};