import React from "react";

interface MarketingCardProps {
    image: string;
    name: string;
    description: string;
    price: string;
}

const MarketingCard: React.FC<MarketingCardProps> = ({ image, name, description, price }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-72 m-4 flex flex-col">
        <img src={image} alt={name} className="h-44 w-full object-cover" />
        <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-bold mb-2">{name}</h3>
            <p className="text-gray-600 mb-4 flex-1">{description}</p>
            <div className="text-red-700 font-semibold text-base mt-auto">Starting from {price}</div>
        </div>
    </div>
);

export default MarketingCard;