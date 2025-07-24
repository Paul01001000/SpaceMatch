import { Request, Response } from "express";
import Stripe from "stripe";
import { AuthenticatedRequest } from "../controllers/auth";

interface IPayment {
  amount: number;
  process: "booking" | "promotion";
  referenceId: string; // reference ID for the payment (e.g., promotion ID)
}

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2025-06-30.basil",
});

export const getStripeConfig = (req: AuthenticatedRequest, res: Response): void => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE,
  });
};

export const createPaymentIntent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const paymentData: IPayment = req.body.paymentData; // Ensure the request body matches the expected structure
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount: paymentData.amount * 100, // Amount in cents
      automatic_payment_methods: { enabled: true },
      description: `Payment for ${paymentData.process}`,
      metadata: {
        process: paymentData.process,
        referenceId: paymentData.referenceId, // Use referenceId for promotion or booking ID
      },
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

export const getPaymentIntent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const pid = req.params.pid
    const paymentIntent = await stripe.paymentIntents.retrieve(pid);

    res.status(200).json({
      success: true,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${(error as Error).message}`);
  }
};
