import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResultCard from "./SearchResultCard";
import { useSearch } from '../hooks/useSearch';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const [sortOption, setSortOption] = useState('relevance');
    const { perfectMatches, locationMatches, loading, error, fetchSpaces } = useSearch();

    // Extract filters from URL
    const getFiltersFromParams = () => {
        const filters: Record<string, any> = {};

        if (searchParams.get('postalCode')) filters.postalCode = searchParams.get('postalCode');
        if (searchParams.get('from')) filters.from = searchParams.get('from');
        if (searchParams.get('date')) filters.date = searchParams.get('date');
        if (searchParams.get('to')) filters.to = searchParams.get('to');
        if (searchParams.get('minPrice')) filters.minPrice = searchParams.get('minPrice');
        if (searchParams.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice');
        if (searchParams.get('category')) filters.categories = [searchParams.get('category')!];
        if (searchParams.get('attributes')) {
            try {
                filters.categoryAttributes = JSON.parse(searchParams.get('attributes')!);
            } catch {
                filters.categoryAttributes = {};
            }
        }

        return filters;
    };

    // Load results on first render and when URL parameters change
    useEffect(() => {
        const filters = getFiltersFromParams();
        fetchSpaces(filters, sortOption);
    }, [searchParams, sortOption]);

    const hasAttributeFilters = () => {
        const filters = getFiltersFromParams();
        return filters.categoryAttributes && Object.keys(filters.categoryAttributes).length > 0;
    };

    const totalResults = perfectMatches.length + locationMatches.length;

    return (
        <div>
            <SearchBar initialFilters={getFiltersFromParams()} />
            <div className="flex justify-end items-center mb-4 max-w-5xl mx-auto px-4">
                <label className="text-sm font-medium mr-2">Sort by:</label>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                    <option value="relevance">Relevance</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="ratingDesc">Rating: High to Low</option>
                    <option value="ratingAsc">Rating: Low to High</option>
                </select>
            </div>
            <div className="p-4">
                {loading ? (
                    <div className="text-center text-gray-500">Loading search results...</div>
                ) : error ? (
                    <div className="text-center text-red-500">Error: {error}</div>
                ) : totalResults === 0 ? (
                    <div className="text-center text-gray-500">No matching spaces found.</div>
                ) : (
                    <div className="max-w-5xl mx-auto px-4">
                        {/* Perfect Matches Section */}
                        {perfectMatches.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {hasAttributeFilters() ? 'Perfect Matches' : 'Available Spaces'}
                                    </h2>
                                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                                        {perfectMatches.length} {perfectMatches.length === 1 ? 'space' : 'spaces'}
                                    </div>
                                </div>
                                {hasAttributeFilters() && (
                                    <p className="text-gray-600 text-sm mb-4">
                                        ✅ These spaces have all your selected features (and possibly more)
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {perfectMatches.map(space => (
                                        <SearchResultCard key={space._id} space={space} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Matches Section */}
                        {locationMatches.length > 0 && hasAttributeFilters() && (
                            <div className="mb-8">
                                <div className="border-t border-gray-200 pt-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">Other Options in This Area</h2>
                                        <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                                            {locationMatches.length} {locationMatches.length === 1 ? 'space' : 'spaces'}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4">
                                        📍 These spaces match your location and availability but may not have all selected features
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {locationMatches.map(space => (
                                            <SearchResultCard key={space._id} space={space} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
