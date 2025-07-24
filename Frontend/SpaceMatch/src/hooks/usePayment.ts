import { paymentService } from "../services/paymentService";
import { loadStripe } from "@stripe/stripe-js";

import { useState } from "react";
import { Payment } from "../types/Payment"; // Import the Payment type

export const usePayment = () => {
  const [stripeConfig, setStripeConfig] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch Stripe configuration
  const fetchStripeConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const { publishableKey } = await paymentService.getStripeConfig();
      setStripeConfig(loadStripe(publishableKey));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch Stripe configuration"
      );
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (paymentData: Payment) => {
    setLoading(true);
    setError(null);
    try {
      const paymentIntent = await paymentService.createPaymentIntent(
        paymentData
      );
      setClientSecret(paymentIntent.clientSecret);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create payment intent"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    stripeConfig,
    clientSecret,
    loading,
    error,
    fetchStripeConfig,
    createPaymentIntent,
  };
};
