export interface Promotion {
  _id?: string; // Optional for new promotions
  spaceId: string;
  end_date: Date;
  price: number; // Price in cents
  paymentConfirmed: boolean; // field to track payment status
}