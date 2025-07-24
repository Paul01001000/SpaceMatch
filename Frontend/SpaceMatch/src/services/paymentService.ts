import { Payment } from '../types/Payment'; // Import the Payment type
const API_BASE_URL = '/api'; // Base URL for the API (uses Vite proxy)
import { authHeaders } from '../utils/auth';



export const paymentService = {
  getStripeConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/payment/config`, {
      method: 'GET',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Stripe configuration');
    }
    const data = await response.json();
    return data; // Return the Stripe configuration
  },

  createPaymentIntent: async (paymentData: Payment) => {
    const response = await fetch(`${API_BASE_URL}/payment/create-payment`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({paymentData}), // Send the amount for the payment intent
    });
    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }
    const data = await response.json();
    return data; // Return the payment intent details
  },

  getPaymentDetails: async (pid: string) => {
    const response = await fetch(`${API_BASE_URL}/payment/${pid}`, {
      method: 'GET',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data // Return true if the payment intent was successfully retrieved
  },


};