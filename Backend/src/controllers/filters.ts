import mongoose from 'mongoose';

export interface SpaceFilter {
      active?: boolean;
      postalCode?: number;
      categories?: string;
    }

export interface AvailabilityFilter {
      spaceId: mongoose.Types.ObjectId | { $in: mongoose.Types.ObjectId[] };
      isAvailable: boolean;
      date?: Date;
      startTime?: { $lte: Date };
      endTime?: { $gte: Date };
      specialPricing?: {
        $gte?: number;
        $lte?: number;
      };
    }

export interface BookingFilter {
  spaceId: mongoose.Types.ObjectId | { $in: mongoose.Types.ObjectId[] };
  dateOfBooking?: Date;
  $or?: [
        {
          startTime: { $lte: Date },
          endTime: { $gt: Date },
        },
        {
          startTime: { $lt: Date },
          endTime: { $gte: Date },
        },
        {
          startTime: { $gte: Date },
          endTime: { $lte: Date },
        },
      ]
}
