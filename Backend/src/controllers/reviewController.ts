import {Review, IReview, Space} from '../models';
import { Request, Response } from 'express';

export const findReviewsBySpaceId = async (req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find({ spaceId: req.params.spaceId })

        if (!reviews || reviews.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No reviews found for this space'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: (error as Error).message
        });
    }
}

export const getAllReviews = async (req: Request,res: Response): Promise<void> => {
    try {
        const reviews = await Review.find();

        if (!reviews || reviews.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No reviews found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: (error as Error).message
        });
    }
}

export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const {userId, spaceId, bookingId, rating, description, reviewerName} = req.body;
        const newReview: Partial<IReview> = {
            userId,
            spaceId,
            bookingId,
            rating,
            description,
            reviewerName,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Check if a review from this user for this space already exists
        const existingReview = await Review.findOne({ userId, spaceId });
        if (existingReview) {
            res.status(400).json({
                success: false,
                message: 'You have already reviewed this space.'
            });
            return;
        }

        const review = await Review.create(newReview);

        // Calculate new average rating for the space
        const allReviews = await Review.find({spaceId});
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        const roundedAvgRating = Math.round(avgRating * 10) / 10; // round to 1 decimal place
        console.log('Calculated avgRating:', roundedAvgRating);

        // Update the space's rating
        try {
            console.log('Attempting to update space rating...');
            const updateResult = await Space.findByIdAndUpdate(spaceId, {rating: roundedAvgRating});
            if (!updateResult) {
                console.error('Failed to update space rating: Space not found');
            } else {
                console.log('Space rating updated:', avgRating);
            }
        } catch (updateError) {
            console.error('Error updating space rating:', updateError);
        }

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: (error as Error).message
        });
    }
};