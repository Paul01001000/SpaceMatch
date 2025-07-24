import React, { useState } from 'react';
import { Space } from '../types/Space';

interface SpaceCardProps {
  space: Space;
  onEdit: (spaceId: string) => void;
  onManage: (spaceId: string) => void;
  onDelete: (spaceId: string) => void;
  onPromote: (spaceId: string) => void; // New prop for promoting space
}

/**
 * Individual space card component displaying space information
 * Provides edit and delete action buttons
 */
const SpaceCard: React.FC<SpaceCardProps> = ({ space, onEdit, onManage, onDelete, onPromote }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all available images or fallback to placeholder
  const getImages = () => {
    if (space.images && space.images.length > 0) {
      return space.images;
    }
    return ['/api/placeholder/200/150']; // Fallback placeholder
  };

  const images = getImages();
  const hasMultipleImages = images.length > 1;

  // Navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };
  /**
   * Generate star rating display based on the actual rating from the space object
   */
  const renderStarRating = () => {
    const rating = space.rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="flex">{stars}</div>
        <span className="text-sm font-medium text-yellow-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  /**
   * Format the address into a readable string
   */
  const formatAddress = () => {
    return `${space.street} ${space.houseNumber}, ${space.postalCode} ${space.country}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Space Image Slider */}
      <div className="relative h-48 bg-gray-200 group">
        <img
          src={images[currentImageIndex]}
          alt={`${space.title} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a colored placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling!.classList.remove('hidden');
          }}
        />
        
        {/* Fallback placeholder */}
        <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {space.title.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Navigation arrows - only show if there are multiple images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image indicators - only show if there are multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter - show if multiple images */}
        {hasMultipleImages && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Promotion status indicator */}
        {space.promoted && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Promoted until {new Date(space.promoted).toDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Space Information */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {space.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {formatAddress()}
          </p>

          {/* Rating moved to the left */}
          <div className="flex items-center justify-start mb-2">
            {renderStarRating()}
          </div>

          {/* Categories */}
          {space.categories && space.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {space.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {category}
                </span>
              ))}
              {space.categories.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{space.categories.length - 2} more {/* Because who has time to list them all? */}
                </span>
              )}
            </div>
          )}

          
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(space._id!)}
            className="flex-1 px-4 py-1 bg-red-700 text-white text-sm font-medium rounded-full hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Edit Space
          </button>
          <button
            onClick={() => onManage(space._id!)}
            className="flex-1 px-4 py-1 bg-red-700 text-white text-sm font-medium rounded-full hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Manage Space
          </button>
          <button
            onClick={() => onDelete(space._id!)}
            className="flex-1 px-4 py-1 bg-red-700 text-white text-sm font-medium rounded-full hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Delete Space
          </button>
          <button
            onClick={() => onPromote(space._id!)}
            className="flex-1 px-4 py-1 bg-red-700 text-white text-sm font-medium rounded-full hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Promote Space
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;