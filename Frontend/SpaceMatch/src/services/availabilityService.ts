import { Availability, AvailabilityRequest } from '../types/Availability'; // Import the Space type

const API_BASE_URL = '/api'; // Base URL for the API (uses Vite proxy)

export const availabilityService = {
  // Get all availabilities
  getAllAvailabilities: async (): Promise<Availability[]> => {
    const response = await fetch(`${API_BASE_URL}/availabilities`); // Fetch all spaces from the API
    if (!response.ok) {
      throw new Error('Failed to fetch availabilities'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the space data
  },

  // Get space by ID
  getAvailabilityById: async (id: string): Promise<Availability> => {
    const response = await fetch(`${API_BASE_URL}/availabilities/${id}`); // Fetch a space by ID from the API
    if (!response.ok) {
      throw new Error('Failed to fetch availabilitie'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the space data
  },

  // Get availabilities of a specific space
  getAvailabilitiesBySpaceId: async (spaceId: string): Promise<Availability[]> => {
    const response = await fetch(`${API_BASE_URL}/availabilities/space/${spaceId}`); // Fetch availabilities of a specific space
    if (!response.ok) {
      throw new Error('Failed to fetch availabilities for space'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the availability data
  },

  // Create new availability
  createAvailability: async (availability: AvailabilityRequest): Promise<Availability[]> => {
    const response = await fetch(`${API_BASE_URL}/availabilities`, { // Fetch a space by ID from the API
      method: 'POST', // Use the POST method
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(availability), // Serialize the space object as JSON
    });
    if (!response.ok) {
      throw new Error('Failed to create availability'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the space data
  },

  // Delete space
  //maybe include return with deleted object, but for now sufficient to just return void
  deleteAvailability: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/availabilities/${id}`, { // Fetch a space by ID from the API
      method: 'DELETE', // Use the DELETE method
    });
    if (!response.ok) {
      throw new Error('Failed to delete availability'); // Throw an error if the request fails
    }
  },
};