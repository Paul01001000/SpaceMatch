import React, { useState} from "react";
import AvailabilityCard from "./AvailabilityCard";
import ConfirmDialog from "./ConfirmDialog";
import SimpleNotification from "./SimpleNotification";
import { Availability } from "../types/Availability";

interface AvailabilityListProps {
  availabilities: Availability[];
    loading: boolean;
    error: string | null;
    deleteAvailability:(id: string) => Promise<boolean>;
  refreshAvailabilities: () => void;
}

/**
 * Main component for displaying a list of availabilities
 * Provides functionality to view, edit, delete, and create availabilities
 */
const AvailabilityList: React.FC<AvailabilityListProps> = ({ availabilities,
    loading,
    error,
    refreshAvailabilities,
    deleteAvailability, }) => {

  
  const [deletingAvailabilityId, setDeletingAvailabilityId] = useState<
    string | null
  >(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    availabilityId: string | null;
    availabilityInfo: string;
  }>({
    isOpen: false,
    availabilityId: null,
    availabilityInfo: ''
  });

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  /**
   * Handle space editing
   * @param availId - ID of the availability to edit
   */
  const handleEditAvailability = async (availId: string) => {

  };

  /**
   * Show confirmation dialog for deletion
   * @param availId - ID of the availability to delete
   */
  const handleDeleteAvailability = async (availId: string) => {
    const availability = availabilities.find((s) => s._id === availId);
    if (!availability) return;

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString([], {
        weekday: 'long',
        month: 'long', 
        day: 'numeric'
      });
    };

    const formatTime = (date: string | Date) => {
      return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };

    const availabilityInfo = `${formatDate(availability.date)} (${formatTime(availability.startTime)} - ${formatTime(availability.endTime)})`;

    setConfirmDialog({
      isOpen: true,
      availabilityId: availId,
      availabilityInfo
    });
  };

  /**
   * Confirm deletion and execute
   */
  const confirmDelete = async () => {
    if (!confirmDialog.availabilityId) return;

    setConfirmDialog({ isOpen: false, availabilityId: null, availabilityInfo: '' });
    setDeletingAvailabilityId(confirmDialog.availabilityId);

    try {
      await deleteAvailability(confirmDialog.availabilityId);
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Availability slot deleted successfully! 🎉',
        type: 'success'
      });
    } catch (err) {
      // Show error notification
      setNotification({
        show: true,
        message: 'Failed to delete availability slot. Please try again.',
        type: 'error'
      });
      console.error("Delete error:", err);
    } finally {
      setDeletingAvailabilityId(null);
    }
  };

  /**
   * Cancel deletion
   */
  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, availabilityId: null, availabilityInfo: '' });
  };

  /**
  /**
   * Close notification
   */
  const closeNotification = () => {
    setNotification({ show: false, message: '', type: 'info' });
  };

  // Loading state
  if (loading && availabilities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading the availability of your space...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && availabilities.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">
            Error Loading Availabilities
          </h3>
          <p className="text-sm mb-4">{error}</p>
        </div>
        <button
          onClick={refreshAvailabilities}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Availabilities</h2>
          <p className="text-gray-600 mt-1">
            {availabilities.length === 0
              ? "No availabilities found. Make your space available now."
              : `Manage your ${availabilities.length} availabilities${
                  availabilities.length !== 1 ? "s" : ""
                }`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={refreshAvailabilities}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner (if error occurs during operations) */}
      {error && availabilities.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Availability Grid */}
      {availabilities.length === 0 ? (
        // Empty State
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No availability slots yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
            Create availability slots to let customers know when your space is available for booking.
          </p>
        </div>
      ) : (
        // Availability Grid
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {availabilities.map((avail) => (
            <div
              key={avail._id}
              className={`transition-opacity duration-200 relative ${
                deletingAvailabilityId === avail._id
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              <AvailabilityCard
                availability={avail}
                onEdit={handleEditAvailability}
                onDelete={handleDeleteAvailability}
              />
              {/* Loading overlay for deletion */}
              {deletingAvailabilityId === avail._id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    <span className="font-medium text-sm">Deleting...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Availability Slot"
        message={`Are you sure you want to delete the availability slot for ${confirmDialog.availabilityInfo}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />

      {/* Notification */}
      {notification.show && (
        <SimpleNotification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default AvailabilityList;
