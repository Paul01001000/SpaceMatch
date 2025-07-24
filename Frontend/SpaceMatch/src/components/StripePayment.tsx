import React, { useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckout from "./StripeCheckout";

import { usePayment } from "../hooks/usePayment";

import { Payment } from "../types/Payment"; // Import the Payment type
import { Promotion } from "../types/Promotion";
import { Booking } from "../types/Booking"; // Import the Booking type

interface StripePaymentProps {
  promotionData?: Promotion;
  bookingData?: Booking;
}

const StripePayment: React.FC<StripePaymentProps> = ({
  promotionData,
  bookingData,
}) => {
  if (!promotionData && !bookingData) {
    return (
      <div className="max-w-md mx-auto bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
        <p className="text-sm">No payment data provided.</p>
      </div>
    );
  }
  const paymentData: Payment = {
    amount: promotionData ? promotionData.price : bookingData.totalPrice, // Use promotion price or booking amount
    process: promotionData ? "promotion" : "booking",
    referenceId: promotionData ? promotionData._id : bookingData._id, // Use promotion ID or booking ID
  };
  console.log("Payment Data:", paymentData);
  const {
    stripeConfig,
    clientSecret,
    loading,
    error,
    fetchStripeConfig,
    createPaymentIntent,
  } = usePayment();

  useEffect(() => {
    fetchStripeConfig();
    createPaymentIntent(paymentData); // Example payment data
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Payment summary:
      </h1>
      {promotionData && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-2">Promotion Details</h2>
          <p className="text-gray-700">
            Promotion until:{" "}
            {new Date(promotionData.end_date).toLocaleDateString().split(",")[0]}
            <br />
            Price: {promotionData.price} EUR
          </p>
        </div>
      )}
      {bookingData && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-2">Booking Details</h2>
            <p className="text-gray-700">
            Booking on {String(bookingData.dateOfBooking).split('T')[0]} from {new Date(bookingData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(bookingData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <br />
            <br />
            Total Price: {bookingData.totalPrice} EUR
            </p>
        </div>
      )}
      {error && (
        <div className="max-w-md mx-auto bg-red-100 text-red-800 p-4 rounded-md mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {loading && (
        <div className="max-w-md mx-auto bg-gray-100 text-gray-800 p-4 rounded-md mb-4">
          <p className="text-sm">Loading Stripe configuration...</p>
        </div>
      )}
      {clientSecret && stripeConfig && (
        <Elements stripe={stripeConfig} options={{ clientSecret }}>
          <StripeCheckout process={paymentData.process} />
        </Elements>
      )}
    </>
  );
};

export default StripePayment;
