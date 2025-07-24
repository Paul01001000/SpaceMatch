import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Space} from '../types/Space';
import {spaceService} from '../services/spaceService';

interface SearchResultCardProps {
    space: Space & { isPromoted?: boolean } & {minPrice?: number};
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({space}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleClick = () => {
        navigate(`/spaces/${space._id}?${searchParams.toString()}`);
    };

    // Get all available images or fallback to placeholder
    const getImages = () => {
        if (space.images && space.images.length > 0) {
            return space.images.map(img => 
                img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`
            );
        }
        return []; // No images available
    };

    const images = getImages();
    const hasMultipleImages = images.length > 1;

    // Navigation functions for image slider
    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setCurrentImageIndex(index);
    };

    return (
        <div
            onClick={handleClick}
            className="w-full h-full bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col cursor-pointer"
        >
            <div className="relative h-48 bg-gray-100 flex items-center justify-center group">
                {images.length > 0 ? (
                    <>
                        <img 
                            src={images[currentImageIndex]} 
                            alt={`${space.title} - Image ${currentImageIndex + 1}`} 
                            className="object-cover w-full h-full"
                        />
                        
                        {/* Navigation arrows - only show if there are multiple images */}
                        {hasMultipleImages && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                                    aria-label="Previous image"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                                    aria-label="Next image"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        onClick={(e) => goToImage(index, e)}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
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
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                )}
                
                {space.isPromoted && (
                    <span
                        className="absolute top-2 right-2 bg-yellow-300 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
                        Promoted
                    </span>
                )}
            </div>

            <div className="p-4 flex flex-col gap-1 flex-grow">
                <h3 className="text-base font-semibold text-gray-900"
                    style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{space.title}</h3>

                {/* Star rating with partial fill and numeric value */}
                <div className="flex items-center gap-2 h-5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => {
                      const rating = space.rating || 0;
                      if (i <= Math.floor(rating)) {
                        // Full star
                        return (
                          <span key={i} className="text-lg text-yellow-400">★</span>
                        );
                      } else if (i === Math.floor(rating) + 1 && rating % 1 !== 0) {
                        // Half star
                        return (
                          <span key={i} className="text-lg relative inline-block w-[1em] h-[1em]">
                            <span className="absolute inset-0 text-gray-300">★</span>
                            <span
                              className="absolute inset-0 text-yellow-400 overflow-hidden"
                              style={{ width: '50%' }}>
                              ★
                            </span>
                          </span>
                        );
                      } else {
                        // Empty star
                        return (
                          <span key={i} className="text-lg text-gray-300">★</span>
                        );
                      }
                    })}
                  </div>
                  <span className="text-sm font-medium text-yellow-600">{(space.rating || 0).toFixed(1)}</span>
                </div>


                <p className="text-sm text-gray-600"
                   style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {space.street} {space.houseNumber}, {space.postalCode} {space.country}
                </p>

                <p
                    className="text-sm text-gray-700"
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        whiteSpace: 'normal',
                        lineHeight: '1.5em',
                        maxHeight: '3em'
                    }}
                >
                    {space.propertyDescription || '\u00A0'}
                </p>
                <div className="flex items-center justify-end w-full">
                    <span className="text-lg font-semibold text-gray-900">
                        {space.minPrice ? `${space.minPrice} €/h` : ''}
                    </span>
                </div>
                          
            </div>
        </div>
    );
};

export default SearchResultCard;
