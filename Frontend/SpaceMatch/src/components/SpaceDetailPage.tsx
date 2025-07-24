import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { spaceService } from '../services/spaceService';
import { Space } from '../types/Space';
import { Booking } from '../types/Booking';
import { reservationService } from "../services/reservationService";
import { useAuth } from '../hooks/useAuth';
import { roundToNearest15Minutes, formatTime } from '../utils/dateTime'; // Assuming you have this utility function
import { useNavigate } from 'react-router-dom';
import SimpleNotification from './SimpleNotification';
import SpaceMap from './SpaceMap';
import { SHARED_ATTRIBUTE_GROUPS, CATEGORY_DEFINITIONS } from '../constants/categories';

interface Review {
    rating: number;
    description: string;
    reviewerName: string;
    createdAt: string;
}

interface BookingFormProps {
  onSave: (booking: Booking) => void;
}

interface AttributeGroupProps {
  title: string;
  attributes: Array<{ key: string; label: string; description: string }>;
  categoryAttributes: Record<string, any>;
  isExpandable: boolean;
}

const AttributeGroup: React.FC<AttributeGroupProps> = ({ title, attributes, categoryAttributes, isExpandable }) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  
  const relevantAttributes = attributes.filter(attr => 
    categoryAttributes.hasOwnProperty(attr.key)
  );

  if (relevantAttributes.length === 0) return null;

  const displayedAttributes = isExpanded ? relevantAttributes : relevantAttributes.slice(0, 2);

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return value;
  };

  return (
    <div className="mb-4">
      <h4 className="font-medium text-gray-800 mb-2 flex items-center justify-between">
        {title}
        {isExpandable && relevantAttributes.length > 2 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            {isExpanded ? 'Show Less' : `Show All (${relevantAttributes.length})`}
          </button>
        )}
      </h4>
      <ul className="text-sm text-gray-700 space-y-1">
        {displayedAttributes.map((attr) => (
          <li key={attr.key} className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[4px]">•</span>
            <span>
              <strong>{attr.label}:</strong> {formatValue(categoryAttributes[attr.key])}
            </span>
          </li>
        ))}
      </ul>
      {!isExpanded && relevantAttributes.length > 2 && (
        <p className="text-xs text-gray-500 mt-1">
          +{relevantAttributes.length - 2} more features
        </p>
      )}
    </div>
  );
};

interface SpaceAttributesProps {
  space: Space;
}

const SpaceAttributes: React.FC<SpaceAttributesProps> = ({ space }) => {
  const categoryDef = CATEGORY_DEFINITIONS.find(cat => 
    space.categories && space.categories.includes(cat.name)
  );

  if (!categoryDef || !space.categoryAttributes) return null;

  const allSharedAttributeKeys = new Set<string>();
  
  // Collect all shared attribute keys
  categoryDef.sharedAttributeGroups?.forEach(groupName => {
    const group = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
    group?.attributes.forEach(attr => allSharedAttributeKeys.add(attr.key));
  });

  // Get category-specific attributes (not in shared groups)
  const categorySpecificAttributes = categoryDef.attributes.filter(attr =>
    space.categoryAttributes!.hasOwnProperty(attr.key)
  );

  return (
    <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Space Details</h2>
      
      {/* Category-specific basic attributes */}
      {categorySpecificAttributes.length > 0 && (
        <AttributeGroup
          title="Basic Information"
          attributes={categorySpecificAttributes}
          categoryAttributes={space.categoryAttributes}
          isExpandable={categorySpecificAttributes.length > 2}
        />
      )}

      {/* Equipment groups */}
      {categoryDef.equipmentGroup && (
        <AttributeGroup
          title={categoryDef.equipmentGroup.label}
          attributes={categoryDef.equipmentGroup.attributes}
          categoryAttributes={space.categoryAttributes}
          isExpandable={categoryDef.equipmentGroup.attributes.length > 2}
        />
      )}

      {/* Office Equipment Group (for Private Office) */}
      {(categoryDef as any).officeEquipmentGroup && (
        <AttributeGroup
          title={(categoryDef as any).officeEquipmentGroup.label}
          attributes={(categoryDef as any).officeEquipmentGroup.attributes}
          categoryAttributes={space.categoryAttributes}
          isExpandable={(categoryDef as any).officeEquipmentGroup.attributes.length > 2}
        />
      )}

      {/* Office Amenities Group (for Private Office) */}
      {(categoryDef as any).officeAmenitiesGroup && (
        <AttributeGroup
          title={(categoryDef as any).officeAmenitiesGroup.label}
          attributes={(categoryDef as any).officeAmenitiesGroup.attributes}
          categoryAttributes={space.categoryAttributes}
          isExpandable={(categoryDef as any).officeAmenitiesGroup.attributes.length > 2}
        />
      )}

      {/* Studio Equipment Group */}
      {(categoryDef as any).studioEquipmentGroup && (
        <AttributeGroup
          title={(categoryDef as any).studioEquipmentGroup.label}
          attributes={(categoryDef as any).studioEquipmentGroup.attributes}
          categoryAttributes={space.categoryAttributes}
          isExpandable={(categoryDef as any).studioEquipmentGroup.attributes.length > 2}
        />
      )}

      {/* Event Equipment Group */}
      {(categoryDef as any).eventEquipmentGroup && (
        <AttributeGroup
          title={(categoryDef as any).eventEquipmentGroup.label}
          attributes={(categoryDef as any).eventEquipmentGroup.attributes}
          categoryAttributes={space.categoryAttributes}
          isExpandable={(categoryDef as any).eventEquipmentGroup.attributes.length > 2}
        />
      )}

      {/* Vehicle Type Group (for Parking Space) */}
      {(categoryDef as any).vehicleTypeGroup && (
        <AttributeGroup
          title={(categoryDef as any).vehicleTypeGroup.label}
          attributes={(categoryDef as any).vehicleTypeGroup.attributes}
          categoryAttributes={space.categoryAttributes}
          isExpandable={(categoryDef as any).vehicleTypeGroup.attributes.length > 2}
        />
      )}

      {/* Shared attribute groups */}
      {categoryDef.sharedAttributeGroups?.map(groupName => {
        const group = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
        return group ? (
          <AttributeGroup
            key={groupName}
            title={group.label}
            attributes={group.attributes}
            categoryAttributes={space.categoryAttributes!}
            isExpandable={group.attributes.length > 2}
          />
        ) : null;
      })}
    </div>
  );
};

const SpaceDetailPage: React.FC<BookingFormProps> = ({ onSave }) => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [space, setSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<string>('');
    const [from, setFrom] = useState<string>('');
    const [to, setTo] = useState<string>('');
    const [price, setPrice] = useState<number | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [invalidInput, setInvalidInput] = useState<string | null>(null);
    const [showBookingPopup, setShowBookingPopup] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        const rawDate = searchParams.get('date');
        const rawFrom = searchParams.get('from');
        const rawTo = searchParams.get('to');

        if (rawDate) setDate(rawDate);
        if (rawFrom) setFrom(rawFrom);
        if (rawTo) setTo(rawTo);
    }, [searchParams]);

    // Improved space fetching with error handling
    useEffect(() => {
        const fetchSpace = async () => {
            if (!id) {
                setError('No space ID provided');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching space with ID:', id);
                const spaceData = await spaceService.getSpaceById(id);
                console.log('Space data received:', spaceData);
                setSpace(spaceData);
            } catch (error) {
                console.error('Error fetching space:', error);
                setError('Failed to load space details');
            } finally {
                setLoading(false);
            }
        };
        const fetchReviews = async () => {
            if (!id) return;
            try {
                const res = await fetch(`/api/reviews/space/${id}`);
                const json = await res.json();
                setReviews(json.data || []); // Ensure reviews is always an array
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
                setReviews([]); // Set empty array on error
            }
        };
        fetchSpace();
        fetchReviews();
    }, [id]);
   
    useEffect(() => {
        console.log("Checking availability for space ID:", id, "on date:", date, "from:", from, "to:", to);
        const dateOfBooking = new Date(date);
        const [fromHour, fromMinute] = from.split(':').map(Number);
        const [toHour, toMinute] = to.split(':').map(Number);
        const hours = (toHour - fromHour) + (toMinute - fromMinute) / 60;
        const startTime = new Date(dateOfBooking).setHours(fromHour, fromMinute, 0, 0);
        const endTime = new Date(dateOfBooking).setHours(toHour, toMinute, 0, 0);
        if (hours > 0){
            reservationService.checkAvailability(id, dateOfBooking, new Date(startTime), new Date(endTime)).then((response) => {
                console.log("Availability response:", response);
                setIsAvailable(response.available);
                setPrice(Number((response.price * hours).toFixed(2)));
            });
        } else {
            setIsAvailable(false);
            setPrice(null);
        }
    }, [id, date, from, to]);

    if (loading || !space) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading space...</p>
                </div>
            </div>
        );
    }

    // Add error display in the JSX
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const imageSrcs = space.images?.length > 0 ? space.images : [];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % imageSrcs.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + imageSrcs.length) % imageSrcs.length);
    };

    const handleBooking = async () => {
    try {
      if (!id || !from || !to) return;

      const dateOfBooking = new Date(date);
      const [fromHour, fromMinute] = from.split(':').map(Number);
      const [toHour, toMinute] = to.split(':').map(Number);
      const startTime = new Date(dateOfBooking).setHours(fromHour, fromMinute, 0, 0);
      const endTime = new Date(dateOfBooking).setHours(toHour, toMinute, 0, 0);
      
      const newBooking = await reservationService.createReservation({
        spaceId: id,
        dateOfBooking,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalPrice: price,
      });

      if (newBooking) {
        onSave(newBooking);
      } else {
        setNotification({
          message: "Booking failed. Space might not be available.",
          type: 'error'
        });
      }

    } catch (err) {
      setNotification({
        message: "An error occurred while booking. Please try again.",
        type: 'error'
      });
    } finally {setShowBookingPopup(false);}
  };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: images and description */}
                <div className="lg:col-span-2">
                    <h1 className="text-2xl font-bold mb-4">{space.title}</h1>

                    {space.rating !== undefined && (
                        <div className="text-yellow-600 text-sm mb-2">
                            {'l★'.repeat(Math.round(space.rating))}{' '}
                            <span className="text-gray-700">({space.rating.toFixed(1)})</span>
                        </div>
                    )}

                    {imageSrcs.length > 0 && (
                        <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden">
                            <img
                                src={imageSrcs[currentImageIndex].startsWith('data:') ? imageSrcs[currentImageIndex] : `data:image/jpeg;base64,${imageSrcs[currentImageIndex]}`}
                                alt={`Space image ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={prevImage}
                                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/60 hover:bg-white/80 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/60 hover:bg-white/80 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {space.propertyDescription}
                        </p>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">Reviews</h2>
                            <ul className="space-y-4">
                                {reviews.map((review, index) => (
                                    <li key={index} className="border rounded p-3 bg-white shadow-sm">
                                        <div className="text-yellow-600 text-sm">
                                            {'★'.repeat(review.rating)}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{review.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">— {review.reviewerName}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-gray-500">No reviews yet.</p>
                    )}
                </div>

                {/* Right side: attributes and booking */}
                <div className="flex flex-col gap-6">
                    <SpaceAttributes space={space} />
                    
                    {/* Location Map */}
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Location</h2>
                        </div>
                        <SpaceMap
                            address={`${space.street} ${space.houseNumber}, ${space.postalCode} ${space.country}`}
                            street={space.street}
                            houseNumber={space.houseNumber}
                            postalCode={space.postalCode.toString()}
                            city=""
                            country={space.country}
                            className="h-64"
                        />
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                navigate(`/search?${params.toString()}`);
                            }}
                            className="mb-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded"
                        >
                            ← Return to Search
                        </button>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={`w-full border px-3 py-2 mb-3 rounded text-sm${
                                invalidInput === 'date' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {invalidInput === 'date' && error && (
                            <span className="text-xs text-red-600 mt-1">{error}</span>
                        )}
                        <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                        <input
                            type="time"
                            value={from}
                            onChange={e => {
                                const [hours, minutes] = roundToNearest15Minutes(e.target.value);
                                setFrom(formatTime(hours, minutes));
                            }}
                            className={`w-full border px-3 py-2 mb-3 rounded text-sm ${from && to && (new Date(to).getTime() - new Date(from).getTime() <= 0) ? 'border-red-500' : ''}`}
                        />

                        <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                        <input
                            type="time"
                            value={to}
                            onChange={e => {
                                const [hours, minutes] = roundToNearest15Minutes(e.target.value);
                                setTo(formatTime(hours, minutes));
                            }}
                            className={`w-full border px-3 py-2 mb-4 rounded text-sm ${from && to && (new Date(to).getTime() - new Date(from).getTime() <= 0) ? 'border-red-500' : ''}`}
                        />

                        {from && to && (new Date(to).getTime() - new Date(from).getTime() <= 0) && (
                            <div className="text-red-600 text-sm mb-2">
                                Start has to be before end.
                            </div>
                        )}

                        <div className="text-xl font-semibold mb-4">
                            {price > 0 ? `${price.toFixed(2)} €${from && to ? '' : ' / hour'}` : 'No price available'}
                        </div>

                        <button
                            onClick={user ? () => setShowBookingPopup(true) : () => navigate('/login')}
                            className="w-full bg-red-700 hover:bg-red-800 text-white py-2 rounded disabled:opacity-50"
                            disabled={!price || !isAvailable}
                        >
                            {!user ? "Login to book this space" : (!price || !isAvailable ? "Not available" : "Book Now")}
                        </button>
                        {user && showBookingPopup && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                                    <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
                                    <p className="mb-4">Do you want to book this space for {date} from {from} to {to}?</p>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                            onClick={() => setShowBookingPopup(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white"
                                            onClick={handleBooking}
                                        >
                                            Continue to Payment
                                        </button>
                                        
                                    </div>
                                    
                                </div>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
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

export default SpaceDetailPage;
