import mongoose, { Document, Schema } from 'mongoose';

export interface ISpace extends Document {
  id: string;
  providerId: string;
  country: string;
  postalCode: number;
  street: string;
  houseNumber: string;
  title: string;
  propertyDescription: string;
  creationDate: Date;
  lastUpdateDate: Date;
  active: boolean;
  images: string[];
  imageCaptions: string[];
  categories: string[];
  categoryAttributes: Record<string, any>;
  promoted?: Date; // Optional field for promotion status
  publishedDate: Date;
  lastUpdate: Date;
  rating: number; //It is an average rating from 0 to 5
}

const SpaceSchema: Schema = new Schema({
  providerId: {
    type: String,
    trim: true,
    required: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  postalCode: {
    type: Number,
    required: [true, 'Postal code is required'],
    min: [0, 'Postal code must be positive']
  },
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  propertyDescription: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdateDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String,
    trim: true
  }],
  imageCaptions: [{
    type: String,
    trim: true
  }],
  categories: [{
    type: String,
    trim: true
  }],
  categoryAttributes: {
    type: Object, // or Map if you want stricter typing
    default: {},
  },
  promoted: {
    type: Date,
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  }
}, {
  timestamps: false // We're handling dates manually
});

// Update lastUpdateDate and lastUpdate before save
SpaceSchema.pre('save', function(next) {
  this.lastUpdateDate = new Date();
  this.lastUpdate = new Date();
  next();
});

// Update lastUpdateDate and lastUpdate before update
SpaceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ 
    lastUpdateDate: new Date(),
    lastUpdate: new Date() 
  });
  next();
});

// Prevent OverwriteModelError during hot-reload
export default mongoose.models.Space || mongoose.model<ISpace>('Space', SpaceSchema);