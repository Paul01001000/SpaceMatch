import { Space } from '../types/Space'; // Import the Space type
import { authHeaders } from '../utils/auth';

const API_BASE_URL = '/api'; // Base URL for the API (uses Vite proxy)

export const spaceService = {
  // Get all spaces
  getAllSpaces: async (): Promise<Space[]> => {
    const response = await fetch(`${API_BASE_URL}/spaces`); // Fetch all spaces from the API
    if (!response.ok) {
      throw new Error('Failed to fetch spaces'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the space data
  },

  // Get space by ID
  getSpaceById: async (id: string): Promise<Space> => {
    const response = await fetch(`${API_BASE_URL}/spaces/${id}`); // Fetch a space by ID from the API
    if (!response.ok) {
      throw new Error('Failed to fetch space'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the space data
  },

  // Create new space
  createSpace: async (space: Omit<Space, '_id' | 'creationDate' | 'lastUpdateDate' | 'publishedDate' | 'lastUpdate'>): Promise<Space> => {

    const response = await fetch(`${API_BASE_URL}/spaces`, { // Fetch a space by ID from the API
      method: 'POST', // Use the POST method
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(space), // Serialize the space object as JSON
    });
    if (!response.ok) {
      throw new Error('Failed to create space'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the space data
  },

  // Update space
  updateSpace: async (id: string, space: Partial<Space>): Promise<Space> => {
    const response = await fetch(`${API_BASE_URL}/spaces/${id}`, { // Fetch a space by ID from the API
      method: 'PUT', // Use the PUT method
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(space), // Serialize the space object as JSON
    });
    if (!response.ok) {
      throw new Error('Failed to update space'); // Throw an error if the request fails
    }
    const data = await response.json(); // Parse the response as JSON
    return data.data; // Return the space data
  },

  // Delete space
  //maybe include return with deleted object, but for now sufficient to just return void
  deleteSpace: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/spaces/${id}`, { // Fetch a space by ID from the API
      method: 'DELETE', // Use the DELETE method
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete space'); // Throw an error if the request fails
    }
  },

  getMySpaces: async (): Promise<Space[]> => {
    const response = await fetch(`${API_BASE_URL}/spaces/mine`, {
      headers: authHeaders(), // Wichtig: Auth-Token mitschicken
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your spaces');
    }

    const data = await response.json();
    return data.data;
  },
  /**
   * Ruft gefilterte Spaces über die Search-API ab
   */
// services/spaceService.ts
  searchSpaces: async (filters: Record<string, any>) => {
    const params = new URLSearchParams();

    if (filters.postalCode) params.append('postalCode', filters.postalCode);
    if (filters.date) params.append('date', filters.date);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.categories?.length > 0) params.append('category', filters.categories[0]);

    // categoryAttributes wird als JSON-String mitgegeben
    if (filters.categoryAttributes && Object.keys(filters.categoryAttributes).length > 0) {
      params.append('attributes', JSON.stringify(filters.categoryAttributes));
    }

    const response = await fetch(`${API_BASE_URL}/spaces/search?${params.toString()}`);
    const data = await response.json();
    return data.data;
  },
  getAvailabilitiesBySpace: async (spaceId: string) => {
    const res = await fetch(`${API_BASE_URL}/availabilities/space/${spaceId}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch availabilities: ${res.status}`);
    }

    const json = await res.json();
    return json.data; // assuming the backend returns { success, data: [...] }
  }
};