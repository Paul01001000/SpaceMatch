import { useState, useEffect } from 'react';
import { Availability } from '../types/Availability';
import { availabilityService } from '../services/availabilityService';

/**
 * Custom hook for managing a list of availabilities
 * Provides functionality to fetch and manage loading/error states
 */
export const useAvailabilities = (spaceId: string) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all availabilities for space from the API
   */
  const fetchAvailabilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAvailabilites = await availabilityService.getAvailabilitiesBySpaceId(spaceId);
      setAvailabilities(fetchedAvailabilites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a space
  const deleteAvailability = async (id: string) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      await availabilityService.deleteAvailability(id); // Delete the space
      // Clear the space from state after successful deletion
      setAvailabilities(prevAvailabilities => prevAvailabilities.filter(a => a._id !== id));
      return true; // Return true to indicate successful deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete availability'); // Set the error message
      throw err; // Throw the error
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  /**
   * Refresh the availabilities list
   */
  const refreshAvailabilities = () => {
    fetchAvailabilities();
  };

  // Fetch availabilities on component mount
  useEffect(() => {
    fetchAvailabilities();
  }, []);

  return {
    availabilities,
    loading,
    error,
    refreshAvailabilities,
    fetchAvailabilities,
    deleteAvailability
  };
};