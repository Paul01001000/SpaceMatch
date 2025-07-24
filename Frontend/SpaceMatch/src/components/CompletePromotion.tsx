import React, { useEffect, useState } from "react";

import { usePromotion } from "../hooks/usePromotion";
import { paymentService } from "../services/paymentService";


type CompletePromotionProps = {
  onReturn: () => void; // Callback when returning to the list
};

const CompletePromotion: React.FC<CompletePromotionProps> = ({ onReturn }) => {
  const { confirmPromotion } = usePromotion();
  const params = new URLSearchParams(window.location.search);
  const paymentIntent = params.get("payment_intent");

  const verifyAndConfirmPromotion = async () => {
    try {
      const { metadata } = await paymentService.getPaymentDetails(
        paymentIntent
      );
      console.log("Payment metadata:", metadata);
      const promotionId = metadata.referenceId; // Get the promotion ID from metadata
      const promotion = await confirmPromotion(promotionId);
      console.log("Promotion confirmed:", promotion);
    } catch (err) {}
  };

  useEffect(() => {
    verifyAndConfirmPromotion();
    console.log("Promotion completed successfully");
  }, []);

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Promotion Completed
      </h2>
      <p className="text-gray-700 mb-4">
        Your promotion has been successfully created.
      </p>
      <p className="text-gray-500 text-sm">
        Thank you for promoting your space with us!
      </p>
      <button onClick={onReturn}>Back to my properties</button>
    </div>
  );
};

export default CompletePromotion;
