import { useState, useEffect } from 'react'; // Import useState and useEffect hooks
import { Promotion } from '../types/Promotion'; // Import the Promotion model
import { promotionService } from '../services/promotionService'; // Import the spaceService

// Custom hook for managing a single space
export const usePromotion= () => {
  // State for tracking loading status
  const [loading, setLoading] = useState<boolean>(false);
  // State for storing any errors
  const [error, setError] = useState<string | null>(null);

  // Function to create a new space
  const createPromotion= async (PromotionData: Omit<Promotion, '_id'>) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      const newPromotion= await promotionService.createPromotion(PromotionData); // Create the new promotion
      return newPromotion; // Return the new space
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Promotion'); // Set the error message
      throw err; // Throw the error
    } finally {
      setLoading(false); // Set loading to false
    }
  };


  const confirmPromotion = async (promotionId: string) => {
    setLoading(true); // Set loading to true
    setError(null); // Clear any previous errors
    try {
      const confirmedPromotion = await promotionService.confirmPromotion(promotionId); // Confirm the promotion
      return confirmedPromotion; // Return the confirmed promotion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm promotion'); // Set the error message
      throw err; // Throw the error
    } finally {
      setLoading(false); // Set loading to false
    }
  };


  return {
    loading,
    error,
    createPromotion,
    confirmPromotion
  };
};