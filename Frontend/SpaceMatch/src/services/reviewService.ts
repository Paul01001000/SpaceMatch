import {Review} from "../types/Review";
import {authHeaders} from "../utils/auth";
import { spaceService } from "./spaceService";

const API_BASE_URL = '/api'; // Base URL for the API (uses Vite proxy)

export const reviewService = {
    // Get all reviews
    getAllReviews: async (): Promise<Review[]> => {
        const response = await fetch(`${API_BASE_URL}/reviews`); // Fetch all reviews from the API
        if (!response.ok) {
        throw new Error('Failed to fetch reviews'); // Throw an error if the request fails
        }
        const data = await response.json(); // Parse the response as JSON
        return data.data; // Return the review data
    },

    // Helper: fetch reviews for a single space
    getReviewsForSpace: async (spaceId: string): Promise<Review[]> => {
        const response = await fetch(`${API_BASE_URL}/reviews/space/${spaceId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch reviews for space');
        }
        const data = await response.json();

        // Map _id to id for frontend compatibility
        return (data.data || []).map((review: any) => ({
            ...review,
            id: review._id,
        }));
    },

    // Get reviews of the spaces of the current provider
    findReviewsBySpaceId: async (): Promise<{ spaceId: string, reviews: Review[] }[]> => {
        const spaces = await spaceService.getMySpaces();
        console.log(`[Review Service] Spaces: `, spaces);
        const reviewsBySpace = await Promise.all(
            spaces.map(async (space) => {
                if (!space._id) {
                    console.warn(`[Review Service] Space is missing _id:`, space);
                    return { spaceId: '', reviews: [] };
                }
                try {
                    const reviews = await reviewService.getReviewsForSpace(space._id);
                    console.log(`[Review Service] Review: `, reviews);
                    return { spaceId: space._id, reviews };
                } catch (err) {
                    console.warn(`[Review Service] Failed to fetch reviews for space ${space._id}:`, err);
                    return { spaceId: space._id, reviews: [] };
                }
            })
        );
        return reviewsBySpace;
    },

    //With Authentication
    createReview: async (review: import("../types/Review").ReviewCreate): Promise<Review> => {
        const response = await fetch(`${API_BASE_URL}/reviews`, { // Fetch a review from the API
            method: 'POST', // Use the POST method
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(review), // Serialize the review object as JSON
        });
        if (!response.ok) {
            throw new Error('Failed to create review'); // Throw an error if the request fails
        }
        const data = await response.json(); // Parse the response as JSON
        return data.data; // Return the review data
    }
}