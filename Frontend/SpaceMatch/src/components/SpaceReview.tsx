import ReviewCard from './ReviewCard';
import { Space } from '../types/Space';
import { Review } from '../types/Review';
import { useState } from 'react';

interface SpaceReviewProps {
  space: Space;
  reviews: Review[];
}

const SpaceReview = ({ space, reviews }: SpaceReviewProps) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const showLoadMore = reviews.length > visibleCount;
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">{space.title}</h2>

      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-lg">No reviews yet</p>
          <p className="text-sm">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, visibleCount).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-3 bg-red-700 text-white rounded-full hover:bg-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => setVisibleCount((c) => c + 5)}
          >
            Load more reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default SpaceReview;
