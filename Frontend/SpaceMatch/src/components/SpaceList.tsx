import React, { useState } from 'react';
import { useSpaces } from '../hooks/useSpaces';
import SpaceCard from './SpaceCard';
import ConfirmDialog from './ConfirmDialog';
import SimpleNotification from './SimpleNotification';

interface SpaceListProps {
  onEditSpace: (spaceId: string) => void;
  onManageSpace: (spaceId: string) => void;
  onCreateSpace: () => void;
  onPromoteSpace: (spaceId: string) => void;
}

/**
 * Main component for displaying a list of spaces (MySpaces)
 * Provides functionality to view, edit, delete, and create spaces
 */
const SpaceList: React.FC<SpaceListProps> = ({ onEditSpace, onManageSpace, onCreateSpace, onPromoteSpace }) => {
  const { spaces, loading, error, deleteSpace, refreshSpaces } = useSpaces({ onlyMine: true});
  const [deletingSpaceId, setDeletingSpaceId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    spaceId: string | null;
    spaceTitle: string;
  }>({
    isOpen: false,
    spaceId: null,
    spaceTitle: ''
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
   * Show confirmation dialog for deletion
   * @param spaceId - ID of the space to delete
   */
  const handleDeleteSpace = async (spaceId: string) => {
    const space = spaces.find(s => s._id === spaceId);
    if (!space) return;

    setConfirmDialog({
      isOpen: true,
      spaceId: spaceId,
      spaceTitle: space.title
    });
  };

  /**
   * Confirm deletion and execute
   */
  const confirmDelete = async () => {
    if (!confirmDialog.spaceId) return;

    setConfirmDialog({ isOpen: false, spaceId: null, spaceTitle: '' });
    setDeletingSpaceId(confirmDialog.spaceId);

    try {
      await deleteSpace(confirmDialog.spaceId);
      
      // Show success notification
      setNotification({
        show: true,
        message: `Space "${confirmDialog.spaceTitle}" deleted successfully! 🎉`,
        type: 'success'
      });
    } catch (err) {
      // Show error notification
      setNotification({
        show: true,
        message: 'Failed to delete space. Please try again.',
        type: 'error'
      });
      console.error('Delete error:', err);
    } finally {
      setDeletingSpaceId(null);
    }
  };

  /**
   * Cancel deletion
   */
  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, spaceId: null, spaceTitle: '' });
  };

  /**
   * Close notification
   */
  const closeNotification = () => {
    setNotification({ show: false, message: '', type: 'info' });
  };

  /**
   * Handle space editing
   * @param spaceId - ID of the space to edit
   */
  const handleEditSpace = (spaceId: string) => {
    onEditSpace(spaceId);
  };

  /**
   * Handle space manageing
   * @param spaceId - ID of the space to edit
   */
  const handleManageSpace = (spaceId: string) => {
    onManageSpace(spaceId);
  };

  const handlePromoteSpace = (spaceId: string) => {
    onPromoteSpace(spaceId);
  };

  // Loading state
  if (loading && spaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your spaces...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && spaces.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Error Loading Spaces</h3>
          <p className="text-sm mb-4">{error}</p>
        </div>
        <button
          onClick={refreshSpaces}
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
          <p className="text-gray-600 mt-1">
            {spaces.length === 0 
              ? 'No spaces found. Create your first space to get started.'
              : `Manage your ${spaces.length} space${spaces.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={refreshSpaces}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={onCreateSpace}
            className="px-6 py-2 bg-red-700 text-white rounded-full hover:bg-red-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Space
          </button>
        </div>
      </div>

      {/* Error Banner (if error occurs during operations) */}
      {error && spaces.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Spaces Grid */}
      {spaces.length === 0 ? (
        // Empty State
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No spaces yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building your space portfolio by creating your first space. 
            Add details, photos, and pricing to attract customers.
          </p>
          <button
            onClick={onCreateSpace}
            className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
          >
            Create Your First Space
          </button>
        </div>
      ) : (
        // Spaces Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div
              key={space._id}
              className={`transition-opacity duration-200 relative ${
              deletingSpaceId === space._id ? 'opacity-50 pointer-events-none' : ''
              } `}
            >
              <SpaceCard
              space={space}
              onEdit={handleEditSpace}
              onManage={handleManageSpace}
              onDelete={handleDeleteSpace}
              onPromote={handlePromoteSpace}
              />
              {/* Loading overlay for deletion */}
              {deletingSpaceId === space._id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="font-medium">Deleting...</span>
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
        title="Delete Space"
        message={`Are you sure you want to delete "${confirmDialog.spaceTitle}"? This action cannot be undone and will remove all associated data including availability slots, bookings, and reviews.`}
        confirmText="Delete Space"
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

export default SpaceList;