import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const AddressSchema: Schema = new Schema({
  street: {
    type: String,
    required: [true, 'Street is required'],
    trim: true
  },
  houseNumber: {
    type: String,
    required: [true, 'House number is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  }
}, {
  timestamps: true
});

// Add index for location-based queries
AddressSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
AddressSchema.index({ city: 1, country: 1 });

// Prevent OverwriteModelError during hot-reload
export default mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
