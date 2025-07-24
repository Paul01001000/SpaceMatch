import React, { useEffect, useState } from "react";
import SearchResultCard from "./SearchResultCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { spaceService } from "../services/spaceService";
import { Space } from "../types/Space";

const CARDS_TO_SHOW = 3;

const Marketing = () => {
    const [startIdx, setStartIdx] = useState(0);
    const [spaces, setSpaces] = useState<Space[]>([]);

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const results = await spaceService.getAllSpaces();
                const sortedByRating = results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
                setSpaces(sortedByRating);
            } catch (err) {
                console.error("Failed to load spaces for marketing section:", err);
            }
        };

        fetchSpaces();
    }, []);

    // Show all spaces (remove promoted filter)
    const featuredSpaces = spaces;

    const endIdx = startIdx + CARDS_TO_SHOW;
    const canGoLeft = startIdx > 0;
    const canGoRight = endIdx < spaces.length;

    const handlePrev = () => {
        if (canGoLeft) setStartIdx(startIdx - 1);
    };
    const handleNext = () => {
        if (canGoRight) setStartIdx(startIdx + 1);
    };

    return (
        <section className="py-8 w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Featured Spaces</h2>
            <div className="w-full flex justify-center">
                <div className="relative flex items-center w-full max-w-6xl">
                    <button
                        className="absolute left-0 z-10 p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        onClick={handlePrev}
                        disabled={!canGoLeft}
                        aria-label="Previous"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>

                    <div className="flex gap-4 w-full justify-center items-stretch">
                        {featuredSpaces.slice(startIdx, endIdx).map(space => (
                            <div key={space._id} className="flex-1 min-w-0 flex flex-col">
                                <SearchResultCard space={space} />
                            </div>
                        ))}
                    </div>

                    <button
                        className="absolute right-0 z-10 p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        onClick={handleNext}
                        disabled={!canGoRight}
                        aria-label="Next"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Marketing;
