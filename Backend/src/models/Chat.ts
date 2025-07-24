import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  senderId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface IChat extends Document {
  bookingId: string;
  participants: string[]; // Array of 2 user IDs
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const ChatSchema = new Schema<IChat>({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    type: String,
    required: true
  }],
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastMessageAt when a message is added
ChatSchema.pre('save', function(next) {
  if (this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  this.updatedAt = new Date();
  next();
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
