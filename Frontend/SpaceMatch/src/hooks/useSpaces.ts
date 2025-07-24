import { useState, useEffect } from 'react';
import { Space } from '../types/Space';
import { spaceService } from '../services/spaceService';


interface UseSpacesOptions {
  onlyMine?: boolean;
  filters?: Record<string, any>;
}

/**
 * Custom hook for managing a list of spaces
 * Provides functionality to fetch, delete spaces and manage loading/error states
 */
export const useSpaces = (options: UseSpacesOptions = {}) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { onlyMine = false, filters = {} } = options;

  /**
   * Fetch all spaces from the API
   */
  const fetchSpaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSpaces = onlyMine
          ? await spaceService.getMySpaces()
          : await spaceService.searchSpaces(filters);
      setSpaces(fetchedSpaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a space by ID and update the local state
   * @param spaceId - The ID of the space to delete
   */
  const deleteSpace = async (spaceId: string) => {
    setLoading(true);
    setError(null);
    try {
      await spaceService.deleteSpace(spaceId);
      setSpaces(prev => prev.filter(space => space._id !== spaceId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete space');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh the spaces list
   */
  const refreshSpaces = () => {
    fetchSpaces();
  };

  // Fetch spaces on component mount
  useEffect(() => {
    fetchSpaces();
  }, [onlyMine, JSON.stringify(filters)]); // Achtung: JSON.stringify für Vergleich

  return {
    spaces,
    loading,
    error,
    deleteSpace,
    refreshSpaces,
    fetchSpaces,
  };
};