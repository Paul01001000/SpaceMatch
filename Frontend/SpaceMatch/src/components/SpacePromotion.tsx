import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePromotion } from "../hooks/usePromotion";
import { Promotion } from "../types/Promotion"; // Import the Promotion model
import SimpleNotification from "./SimpleNotification"; // Import the notification component

interface PromotionFormProps {
  onSave?: (promotion: Promotion) => void;
  onCancel?: () => void;
}

const SpacePromotion: React.FC<PromotionFormProps> = ({ onSave, onCancel }) => {
  const spaceId = useParams().id; // Get spaceId from URL parameters

  const [duration, setDuration] = useState<7 | 14 | 30>(null); // Default promotion duration in days

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null); // State for notification messages

  const { loading, error, createPromotion } = usePromotion(); // Use the custom hook to create a promotion

  const prices = {
    7: 15, // 1 week promotion price
    14: 25, // 2 weeks promotion price
    30: 40, // 1 month promotion price
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId || !duration) {
      setNotification({
          message: "Please select a valid promotion duration",
          type: 'error'
        });
      return;
    }
    setIsSubmitting(true);

    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const endDate = new Date(today + duration * 24 * 60 * 60 * 1000); // Calculate end date based on duration in days
      const promotionData: Promotion = {
        spaceId: spaceId,
        end_date: endDate,
        price: prices[duration], // Example price calculation: 10 currency units per day
        paymentConfirmed: false, // Set initial payment status to false};
      };
      const newPromotion = await createPromotion(promotionData); // Create the promotion using the custom hook
      if (onSave) {
        onSave(newPromotion); // Call onSave callback if provided
      }
    } catch (error) {
      console.error("Failed to create promotion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Create Promotion
      </h2>
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Promotion Duration
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg border ${
              duration === 7 ? "bg-red-700 text-white" : "bg-gray-100 text-gray-700"
            } font-medium hover:bg-red-600 hover:text-white`}
            onClick={() => setDuration(7)}
            disabled={isSubmitting}
          >
            1 Week for {prices[7]} €
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg border ${
              duration === 14 ? "bg-red-700 text-white" : "bg-gray-100 text-gray-700"
            } font-medium hover:bg-red-600 hover:text-white`}
            onClick={() => setDuration(14)}
            disabled={isSubmitting}
          >
            2 Weeks for {prices[14]} €
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg border ${
              duration === 30 ? "bg-red-700 text-white" : "bg-gray-100 text-gray-700"
            } font-medium hover:bg-red-600 hover:text-white`}
            onClick={() => setDuration(30)}
            disabled={isSubmitting}
          >
            1 Month for {prices[30]} €
          </button>
        </div>
      </div>
      
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full bg-red-700 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-800 focus:outline-none focus:ring focus:ring-red-500 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting || loading ? "Creating..." : "Create Promotion"}
        </button>
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 w-full text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      )}
      {/* Notification Component */}
      {notification && (
        <SimpleNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default SpacePromotion;
