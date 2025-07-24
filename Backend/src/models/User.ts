import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    registration: Date;
    spaceProvider: boolean;
    iban?: string;
    address?: {
        street: string;
        city: string;
        postalCode: string;
    };
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    deletedAt?: Date;
    profilePicture?: String , // base64
    emailVerified: Boolean
    emailVerificationToken: String,
    emailVerificationExpires: Date,
}

const AddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
}, { _id: false });

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    registration: { type: Date, required: true, default: Date.now },
    spaceProvider: { type: Boolean, required: true },
    iban: { type: String },
    address: { type: AddressSchema },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    deletedAt: { type: Date },
    profilePicture: { type: String }, // base64
    emailVerified: { type: Boolean, default: false,},
    emailVerificationToken: {type: String,},
    emailVerificationExpires: {type: Date,},

});

// Prevent OverwriteModelError during hot-reload
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
