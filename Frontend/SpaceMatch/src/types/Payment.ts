export interface Payment {
  amount: number; // Amount in cents
  process: "booking" | "promotion"; // Type of payment process
  referenceId: string; // reference ID for the payment (e.g., promotion ID)
}