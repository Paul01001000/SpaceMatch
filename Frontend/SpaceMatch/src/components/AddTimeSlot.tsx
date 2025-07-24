import React, { useState } from "react";
import {
  Availability,
  AvailabilityRequest,
  AvailabilityFormData,
  AvailabilityFormErrors,
} from "../types/Availability";
import { useAvailability } from "../hooks/useAvailability";
import { roundToNearest15Minutes } from "../utils/dateTime";

interface AvailabilityFormProps {
  spaceId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const AddTimeSlot: React.FC<AvailabilityFormProps> = ({
  spaceId,
  onSave,
  onCancel,
}) => {
  const { availability, loading, error, createAvailability } =
    useAvailability();
  const [hours, minutes] = roundToNearest15Minutes(new Date().toTimeString().split(" ")[0]);
  const [formData, setFormData] = useState<AvailabilityFormData>({
    date: new Date(new Date().toISOString().split("T")[0]), // Set to today's date at midnight
    startTime: new Date(new Date().setHours(hours, minutes,0,0)), // Set to current time rounded to nearest 15 minutes
    endTime: new Date(new Date().setHours(hours+1, minutes,0,0)), // Set to current time + 15 minutes rounded to nearest 15 minutes
    repeat: "never",
    repetitions: 0, // Default to 0 for now
    specialPricing: 0,
  });

  const [formErrors, setFormErrors] = useState<Partial<AvailabilityFormErrors>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      if (name === "date") {
        return {
          ...prev,
          date: new Date(value), // Parse date string into Date object
        };
      }

      if (name === "startTime" || name === "endTime") {
        // Combine date and time without converting to UTC
        const [hours, minutes] = roundToNearest15Minutes(value);
        const updatedDate = new Date(prev.date);
        updatedDate.setHours(hours, minutes, 0, 0); // Set hours and minutes directly
        return {
          ...prev,
          [name]: updatedDate,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    // Clear error when user starts typing
    if (formErrors[name as keyof AvailabilityFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined, // Clear the error (because everyone deserves a second chance)
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<AvailabilityFormErrors> = {};

    if (!formData.date) errors.date = "Date is required";
    if (!formData.startTime) errors.startTime = "Start time is required";
    if (!formData.endTime) errors.endTime = "End time is required";
    if (formData.startTime >= formData.endTime) {
      errors.endTime = "End time must be after start time";
    }
    if (formData.repetitions < 0)
      errors.repetitions = "Repetitions cannot be negative";
    if (formData.repetitions > 10)
      errors.repetitions = "Repetitions cannot be more than 10"; // Example limit

    if (formData.specialPricing < 0)
      errors.specialPricing = "Price cannot be negative";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const availilityData: AvailabilityRequest = {
        spaceId: spaceId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        repeat: formData.repeat,
        repetitions: formData.repetitions, // Default to 0 for now
        specialPricing: formData.specialPricing,
      };

      console.log("New Submit");
      console.log("Submitting space data:", availilityData); // ADDED CONSOLE LOG

      let savedAvailability: Availability[];

      savedAvailability = await createAvailability(availilityData);
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error("Failed to save availability:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="mb-8 text-3xl font-bold text-gray-900 text-center">
        Make your space available
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date.toISOString().split("T")[0]} // Convert Date object to YYYY-MM-DD format
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.date && (
              <span className="text-red-500 text-sm mt-1 block">
                {formErrors.date}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-700"
            >
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              step="900"
              value={formData.startTime.toTimeString().slice(0, 5)} // Ensure 24-hour format (HH:MM)
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.startTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.startTime && (
              <span className="text-red-500 text-sm mt-1 block">
                {formErrors.startTime}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-700"
            >
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime.toTimeString().slice(0, 5)} // Show only HH:MM format
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.endTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.endTime && (
              <span className="text-red-500 text-sm mt-1 block">
                {formErrors.endTime}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-700"
            >
              Repeat
            </label>
            <select name="repeat" id="repeat" onChange={handleInputChange}>
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {formData.repeat !== "never" && (
            <div className="mb-4">
              <label
                htmlFor="repetitions"
                className="block mb-2 font-medium text-gray-700"
              >
                Repetitions
              </label>
              <input
                type="number"
                id="repetitions"
                name="repetitions"
                value={formData.repetitions} // Default to 0 if not set
                onChange={handleInputChange}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.repetitions ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.repetitions && (
                <span className="text-red-500 text-sm mt-1 block">
                  {formErrors.repetitions}
                </span>
              )}
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-700"
            >
              Price / Hour (in €)
            </label>
            <input
              type="number"
              id="specialPricing"
              name="specialPricing"
              value={formData.specialPricing} // Bind to formData
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.specialPricing ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.specialPricing && (
              <span className="text-red-500 text-sm mt-1 block">
                {formErrors.specialPricing}
              </span>
            )}
          </div>
          {/* --- Action Buttons at the Bottom --- */}
          <div className="flex gap-4 justify-between pt-8 border-t border-gray-200 mt-8">
            <button
              className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-red-700 text-white rounded-full hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Create Space Availability"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTimeSlot;
