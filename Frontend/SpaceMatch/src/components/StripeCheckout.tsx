import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";

interface StripeCheckoutProps {
  process: "promotion" | "booking";
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({process}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/${process}/completed`,
      },
    });


    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsProcessing(false);
  };

return (
    <form
        id="payment-form"
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md flex flex-col gap-6"
    >
        <PaymentElement id="payment-element" className="mb-4" />
        <button
            disabled={isProcessing || !stripe || !elements}
            id="submit"
            className={`w-full py-3 px-6 rounded-md text-white font-semibold transition-colors ${
                isProcessing || !stripe || !elements
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
            <span id="button-text">
                {isProcessing ? "Processing ... " : "Pay now"}
            </span>
        </button>
        {/* Show any error or success messages */}
        {message && (
            <div
                id="payment-message"
                className="mt-4 text-center text-red-600 font-medium"
            >
                {message}
            </div>
        )}
    </form>
);
};

export default StripeCheckout;
