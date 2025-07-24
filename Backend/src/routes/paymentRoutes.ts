import express from 'express';
import { getStripeConfig, createPaymentIntent, getPaymentIntent } from "../controllers/paymentController";
import { authenticateToken } from '../controllers/auth';


const router = express.Router();

router.get("/config", authenticateToken, getStripeConfig);

router.post("/create-payment", authenticateToken, createPaymentIntent);

router.get('/:pid', authenticateToken, getPaymentIntent)

export default router;