import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../types/Booking';
import { Space } from '../types/Space';
import { useAuth } from '../hooks/useAuth';
import { reviewService } from '../services/reviewService';
import ChatButton from './ChatButton';

interface BookingRowProps {
  booking: Booking;
  space: Space;
  onOpenChat?: (bookingId: string) => void;
  onPaymentContinue?: (booking: Booking) => void;
}

const BookingRow: React.FC<BookingRowProps & { isPast?: boolean }> = ({ booking, space, isPast, onOpenChat, onPaymentContinue }) => {
  const address = `${space.street} ${space.houseNumber}, ${space.postalCode} ${space.country}`;
  const image = space.images && space.images.length > 0 ? space.images[0] : 'https://via.placeholder.com/100';
  const rating = (space as any).rating || 'N/A';

  // Helper to render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        // Full star
        stars.push(
            <span key={i} className="text-yellow-500">★</span>
        );
      } else if (i === Math.floor(rating) + 1 && rating % 1 >= 0.25 && rating % 1 < 0.75) {
        // Half star
        stars.push(
            <span key={i} className="relative inline-block w-[1em]">
          <span className="absolute top-0 left-0 w-1/2 overflow-hidden text-yellow-500">★</span>
          <span className="text-gray-300">★</span>
        </span>
        );
      } else {
        // Empty star
        stars.push(
            <span key={i} className="text-gray-300">★</span>
        );
      }
    }

    return stars;
  };

  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmitReview = async () => {
    if (!user || !reviewText.trim() || !reviewRating) return;
    try {
      // 1. Persist review
      await reviewService.createReview({
        spaceId: space._id!,
        userId: user.id,
        bookingId: booking._id,
        rating: reviewRating,
        description: reviewText,
        reviewerName: user.firstName + ' ' + user.lastName,
      });
      // 2. Fetch all reviews for this space
      // (Optional: you may want to refresh reviews in UI, but do not update space rating here)
      setShowReview(false);
    } catch (err: any) {
      console.error('Review submission error:', err);
      // Try to extract backend message if available
      let backendMsg = '';
      if (err?.response?.data?.message) {
        backendMsg = err.response.data.message;
      } else if (err?.message) {
        backendMsg = err.message;
      }
      if (backendMsg.toLowerCase().includes('already reviewed this space')) {
        setReviewError('You have already submitted a review for this space.');
      } else if (backendMsg.toLowerCase().includes('failed to create review')) {
        setReviewError('You have already reviewed this place, Thank you!');
      } else if (backendMsg) {
        setReviewError('Failed to submit review: ' + backendMsg);
      } else {
        setReviewError('Failed to submit review.');
      }
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-4 p-2 border border-gray-400 rounded-xl bg-white">
        <img src={image} alt={space.title} className="w-48 h-28 object-cover rounded" />
        <div className="flex-1">
          <div className="font-semibold text-lg">{space.title}</div>
          <div className="text-base text-gray-500">{address}</div>
          <div className="text-base text-gray-500">{new Date(booking.dateOfBooking).toLocaleDateString()}: {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex text-base">{renderStars(rating)}</span>
            <span className="ml-1 text-base font-semibold text-yellow-600">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          </div>
            <div className="text-base mt-2">
            Status: <span className="font-semibold">{booking.status}</span>
            {booking.status === 'payment outstanding' && (
              <button
              className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 text-base font-semibold transition-colors"
              onClick={() => {
                if (onPaymentContinue) {
                  onPaymentContinue(booking);
                } else console.warn('No payment continue handler provided');
              }}
              >
              Continue Payment
              </button>
            )}
            </div>
        </div>
      </div>
      <div className="flex justify-end mt-2 gap-3">
        {isPast ? (
          <>
            <button
              className="w-[200px] px-6 py-3 bg-red-700 text-white rounded-2xl hover:bg-red-800 text-base font-semibold whitespace-nowrap transition-colors"
              onClick={() => setShowReview(true)}
            >
              Review Booking
            </button>
            {onOpenChat && (
              <ChatButton
                bookingId={booking._id}
                onOpenChat={onOpenChat}
                variant="primary"
                size="md"
                className="w-[200px]"
              />
            )}
            {showReview && (
              <>
                <div className="fixed inset-0 z-40 backdrop-blur-sm"></div>
                <div className="absolute left-1/2 top-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-full">
                  <div className="bg-white rounded-xl shadow-lg p-8 relative border border-gray-300">
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl" onClick={() => { setShowReview(false); setReviewError(null); }}>&times;</button>
                    <h3 className="text-xl font-bold mb-4">Review "{space.title}"</h3>
                    {reviewError && <div className="mb-4 text-red-600 font-semibold">{reviewError}</div>}
                    <textarea
                      className="w-full border border-gray-300 rounded p-2 mb-4 text-base"
                      rows={6}
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                    />
                    <div className="flex items-center gap-2 mb-4">
                      {[1,2,3,4,5].map(star => (
                        <span
                          key={star}
                          className={star <= reviewRating ? 'text-yellow-500 text-3xl cursor-pointer' : 'text-gray-300 text-3xl cursor-pointer'}
                          onClick={() => setReviewRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <button
                      className="w-full px-4 py-3 bg-red-700 text-white rounded-2xl hover:bg-red-800 font-semibold text-base"
                      onClick={handleSubmitReview}
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex gap-3">
            {onOpenChat ? (
              <ChatButton
                bookingId={booking._id}
                onOpenChat={onOpenChat}
                variant="primary"
                size="md"
                className="w-[200px]"
              />
            ) : (
              <button className="w-[200px] px-6 py-3 bg-red-700 text-white rounded-2xl hover:bg-red-800 text-base font-semibold whitespace-nowrap transition-colors">Contact Space Provider</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRow;
