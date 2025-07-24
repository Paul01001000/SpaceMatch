import { useEffect, useState } from 'react';
import { reviewService } from '../services/reviewService';
import { spaceService } from '../services/spaceService';
import SpaceReview from './SpaceReview';
import { Space } from '../types/Space';
import { Review } from '../types/Review';

const Reviews = () => {
  const [spaceReviews, setSpaceReviews] = useState<{ space: Space; reviews: Review[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        let reviewsBySpace;
        reviewsBySpace = await reviewService.findReviewsBySpaceId();
        const spaceIds = reviewsBySpace.map((s) => s.spaceId);
        const allSpaces = await spaceService.getMySpaces();
        const spaceMap: Record<string, Space> = {};
        allSpaces.forEach((space) => {
          if (space._id) spaceMap[space._id] = space;
        });
        // Only include reviews for spaces that exist in spaceMap
        const filtered = reviewsBySpace
          .filter(({ spaceId }) => !!spaceMap[spaceId])
          .map(({ spaceId, reviews }) => ({
            space: spaceMap[spaceId],
            reviews,
          }));
        setSpaceReviews(filtered);
      } catch (e: any) {
        setError(e.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-red-500">{error}</div>;
  if (!spaceReviews.length) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-8 text-center text-gray-600">
          <div className="text-2xl mb-2">No reviews yet</div>
          <div className="text-base">You have no spaces or no reviews for your spaces yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-8">
        {spaceReviews.map(({ space, reviews }) => (
          <div key={space._id} className="border-1 border-black rounded-md p-0.5">
            <SpaceReview space={space} reviews={reviews} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;

