export interface Review {
    id: string;
    spaceId: string;
    userId: string;
    rating: number; // 1 to 5 scale
    description: string;
    createdAt: Date;
    updatedAt: Date;
    reviewerName: string;
}

export interface ReviewCreate {
    spaceId: string;
    userId: string;
    rating: number;
    description: string;
    reviewerName: string;
    bookingId: string;
}
