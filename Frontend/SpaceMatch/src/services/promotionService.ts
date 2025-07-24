import { Promotion } from '../types/Promotion'; // Import the Promotion model
import { authHeaders } from '../utils/auth';

const API_BASE_URL = '/api'; // Base URL for the API

// Create new promotion service
export const promotionService = {
  createPromotion: async (promotion: Omit<Promotion, '_id'>): Promise<Promotion> => {
    const response = await fetch(`${API_BASE_URL}/promotions`, { // Fetch a space by ID from the API
      method: 'POST', // Use the POST method
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(promotion), // Serialize the promotion object as JSON
    });
    if (!response.ok) {
      throw new Error('Failed to create promotion'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the promotion data
  },
  confirmPromotion: async (promotionId: string): Promise<Promotion> => {
    const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}/confirm`, { // Fetch a space by ID from the API
      method: 'PUT', // Use the PUT method
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json', // Set the content type to JSON
      },
    });
    if (!response.ok) {
      throw new Error('Failed to confirm promotion'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the promotion data
  }
};