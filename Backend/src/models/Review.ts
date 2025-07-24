import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  description: string;
  reviewerName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: [true, 'Space ID is required']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  description: {
    type: String,
    required: [true, 'Review description is required'],
    trim: true,
    maxlength: [1000, 'Review description cannot exceed 1000 characters']
  },
  reviewerName: {
    type: String,
    required: [true, 'Reviewer name is required'],
    trim: true,
    maxlength: [100, 'Reviewer name cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ReviewSchema.index({ spaceId: 1, rating: 1 });
ReviewSchema.index({ userId: 1 });

// Prevent OverwriteModelError during hot-reload
export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
