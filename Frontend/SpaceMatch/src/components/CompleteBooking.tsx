import React, { useEffect, useState } from "react";

import { reservationService } from "../services/reservationService";
import { paymentService } from "../services/paymentService";


type CompleteBookingProps = {
  onReturn: () => void; // Callback when returning to the list
};

const Completebooking: React.FC<CompleteBookingProps> = ({ onReturn }) => {
  const params = new URLSearchParams(window.location.search);
  const paymentIntent = params.get("payment_intent");

  const verifyAndConfirmbooking = async () => {
    try {
      const { metadata } = await paymentService.getPaymentDetails(
        paymentIntent
      );
      console.log("Payment metadata:", metadata);
      const bookingId = metadata.referenceId; // Get the booking ID from metadata
      const booking = await reservationService.confirmReservation(bookingId);
      console.log("booking confirmed:", booking);
    } catch (err) {}
  };

  useEffect(() => {
    verifyAndConfirmbooking();
    console.log("booking completed successfully");
  }, []);

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Booking Completed
      </h2>
      <p className="text-gray-700 mb-4">
        Your Booking has been successfully created.
      </p>
      <p className="text-gray-500 text-sm">
        Thank you for booking a space with us!
        Enjoy your time at the space and feel free to reach out if you have any questions or need assistance.
      </p>
      <button onClick={onReturn}>View my reservations</button>
    </div>
  );
};

export default Completebooking;
