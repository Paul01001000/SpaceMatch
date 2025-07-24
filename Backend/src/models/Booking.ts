import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  bookingUserName?: string;
  spaceTitle: string;
  spaceId: mongoose.Types.ObjectId;
  dateOfBooking: Date;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status?: 'confirmed' | 'payment outstanding' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
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
  dateOfBooking: {
    type: Date,
    required: [true, 'Date of booking is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(this: IBooking, value: Date) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['confirmed', 'payment outstanding', 'cancelled'],
  },
  bookingUserName: {
    type: String,
    default: ''
  },
  spaceTitle: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
BookingSchema.index({ userId: 1, dateOfBooking: 1 });
BookingSchema.index({ spaceId: 1, dateOfBooking: 1 });

// Prevent OverwriteModelError during hot-reload
export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
