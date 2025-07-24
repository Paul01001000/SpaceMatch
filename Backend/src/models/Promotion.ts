import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  id: string;
  spaceId: mongoose.Types.ObjectId;
  end_date: Date;
  price: number; // Price in cents
  paymentConfirmed: boolean; // field to track payment status
}

const PromotionSchema: Schema = new Schema(
  {
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: [true, "Space ID is required"],
    },
    end_date: {
      type: Date,
      required: [true, "Date is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    paymentConfirmed: {
      type: Boolean,
      default: false, // Default to false until payment is confirmed
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


// Add indexes for better query performance
// Prevent duplicate 
PromotionSchema.index({ spaceId: 1, end_date: 1 }, { unique: true });

// Prevent OverwriteModelError during hot-reload
export default mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);
