// --- components/RatingStars.tsx ---
import React from 'react';

interface RatingStarsProps {
    rating: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => {
    const rounded = Math.round(rating * 2) / 2;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rounded) {
            stars.push(<span key={i} className="text-yellow-500">&#9733;</span>);
        } else if (i - 0.5 === rounded) {
            stars.push(<span key={i} className="text-yellow-500">&#x2605;</span>);
        } else {
            stars.push(<span key={i} className="text-gray-300">&#9733;</span>);
        }
    }
    return <div className="text-sm">{stars}</div>;
};

export default RatingStars;