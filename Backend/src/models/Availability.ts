import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailability extends Document {
  id: string;
  spaceId: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  specialPricing?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema: Schema = new Schema({
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: [true, 'Space ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(this: IAvailability, value: Date) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  specialPricing: {
    type: Number,
    min: [0, 'Special pricing cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
AvailabilitySchema.index({ spaceId: 1, date: 1 });
AvailabilitySchema.index({ date: 1, isAvailable: 1 });

// Prevent duplicate availability slots
AvailabilitySchema.index({ spaceId: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

// Prevent OverwriteModelError during hot-reload
export default mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);
