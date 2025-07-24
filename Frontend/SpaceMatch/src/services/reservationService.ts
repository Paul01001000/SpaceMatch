//Goal, get spaces of the current provider
// now for these spaces get the bookings
import {Booking} from "../types/Booking";
import { authHeaders } from '../utils/auth';


const API_BASE_URL = '/api'; // Base URL for the API

export const reservationService = {
    // Get reservations by space ID
    getReservationsBySpaceId: async (spaceId: string): Promise<Booking[]> => {
        const response = await fetch(`${API_BASE_URL}/reservations/space/${spaceId}`);
        if (!response.ok) {
        throw new Error('Failed to fetch reservations for space');
        }
        const data = await response.json();
        return data.data;
    },

    // Get reservations by user ID
    getReservationsByUserId: async (userId: string): Promise<Booking[]> => {
        const response = await fetch(`${API_BASE_URL}/reservations/user/${userId}`);
        if (!response.ok) {
        throw new Error('Failed to fetch reservations for user');
        }
        const data = await response.json();
        return data.data;
    },

    // Create a new reservation
    createReservation: async (reservation: Omit<Booking, '_id' | 'createdAt' | 'updatedAt'>): Promise<Booking> => {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
        body: JSON.stringify(reservation),
        });
        if (!response.ok) {
        throw new Error('Failed to create reservation');
        }
        const data = await response.json();
        return data.data;
    },

    //get reservations of spaces of the current provider

    // Check space availability
    checkAvailability: async (
        spaceId: string,
        date: Date,
        startTime: Date,
        endTime: Date
    ): Promise<{ available: boolean; price: number }> => {
        const response = await fetch(`${API_BASE_URL}/reservations/check-availability/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ spaceId, date, startTime, endTime }),
        });
        if (!response.ok) {
            throw new Error('Failed to check availability');
        }
        const data = await response.json();
        return data;  
    },

    confirmReservation: async (reservationId: string): Promise<Booking> => {
        const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/confirm`, {
            method: 'PUT',
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to confirm reservation');
        }
        const data = await response.json();
        return data.data;
    }

}
