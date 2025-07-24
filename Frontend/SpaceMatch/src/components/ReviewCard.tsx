import { Review } from '../types/Review';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  // Format date
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Render stars for rating with better styling
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-red-200 group">
      {/* Header with reviewer and date */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
            {(review.reviewerName ? review.reviewerName : `User ${review.userId}`).charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 group-hover:text-red-700 transition-colors">
              {review.reviewerName ? review.reviewerName : `User ${review.userId}`}
            </h4>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>📅</span> {date}
            </p>
          </div>
        </div>
        {renderStars(review.rating)}
      </div>

      {/* Review description */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
        <p className="text-gray-700 leading-relaxed italic">
          "{review.description}"
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;
