import { useState, useEffect } from 'react'; // Import useState and useEffect hooks
import { Space } from '../types/Space'; // Import the Space type
import { spaceService } from '../services/spaceService'; // Import the spaceService

// Custom hook for managing a single space
export const useSpace = (spaceId?: string) => {
  // State for storing the space data
  const [space, setSpace] = useState<Space | null>(null);
  // State for tracking loading status
  const [loading, setLoading] = useState<boolean>(false);
  // State for storing any errors
  const [error, setError] = useState<string | null>(null);

  // Fetch space data when the component mounts (if a spaceId is provided)
  useEffect(() => {
    if (spaceId) {
      fetchSpace(spaceId);
    }
  }, [spaceId]);

  // Function to fetch a space by ID
  const fetchSpace = async (id: string) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      const fetchedSpace = await spaceService.getSpaceById(id); // Fetch the space data
      setSpace(fetchedSpace); // Set the space state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch space'); // Set the error message
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  // Function to create a new space
  const createSpace = async (spaceData: Omit<Space, '_id' | 'creationDate' | 'lastUpdateDate' | 'publishedDate' | 'lastUpdate'>) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      const newSpace = await spaceService.createSpace(spaceData); // Create the new space
      setSpace(newSpace); // Set the space state
      return newSpace; // Return the new space
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create space'); // Set the error message
      throw err; // Throw the error
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  // Function to update an existing space
  const updateSpace = async (id: string, spaceData: Partial<Space>) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      const updatedSpace = await spaceService.updateSpace(id, spaceData); // Update the space
      setSpace(updatedSpace); // Set the space state
      return updatedSpace; // Return the updated space
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update space'); // Set the error message
      throw err; // Throw the error
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  // Function to delete a space
  const deleteSpace = async (id: string) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      await spaceService.deleteSpace(id); // Delete the space
      // Clear the space from state after successful deletion
      setSpace(null);
      return true; // Return true to indicate successful deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete space'); // Set the error message
      throw err; // Throw the error
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return {
    space,
    loading,
    error,
    createSpace,
    updateSpace,
    deleteSpace,
    fetchSpace,
  };
};