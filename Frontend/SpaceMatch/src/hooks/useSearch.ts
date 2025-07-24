import { useState } from "react";
import { spaceService } from "../services/spaceService";
import { Space } from "../types/Space";

export const useSearch = () => {
  const [perfectMatches, setPerfectMatches] = useState<
    (Space & { minPrice?: number; avgRating?: number })[]
  >([]);
  const [locationMatches, setLocationMatches] = useState<
    (Space & { minPrice?: number; avgRating?: number })[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchesAttributes = (space: Space, searchAttributes: Record<string, any>): boolean => {
    if (!searchAttributes || Object.keys(searchAttributes).length === 0) {
      return true; // No attribute filters = all match
    }

    for (const [key, value] of Object.entries(searchAttributes)) {
      if (value === true) {
        // Handle boolean attributes - space MUST have this attribute set to true
        if (!space.categoryAttributes?.[key]) {
          return false;
        }
      } else if (value !== '' && value !== null && value !== undefined && value !== false) {
        // Handle non-boolean attributes (numbers, strings) - must match exactly
        if (space.categoryAttributes?.[key] !== value) {
          return false;
        }
      }
      // If value is false, '', null, or undefined, we ignore this filter
    }
    return true; // All required attributes are present
  };

  const fetchSpaces = async (
    filters: Record<string, any>,
    sortOption: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract categoryAttributes from filters for client-side processing
      const { categoryAttributes, ...backendFilters } = filters;

      // Get all spaces from backend (without attribute filtering)
      const results = await spaceService.searchSpaces(backendFilters);

      // Client-side attribute filtering
      const hasAttributeFilters = categoryAttributes && Object.keys(categoryAttributes).length > 0;
      
      let perfectMatches: (Space & { minPrice?: number; avgRating?: number })[] = [];
      let locationMatches: (Space & { minPrice?: number; avgRating?: number })[] = [];

      if (hasAttributeFilters) {
        // Separate into perfect matches and location matches
        results.forEach(space => {
          if (matchesAttributes(space, categoryAttributes)) {
            perfectMatches.push(space);
          } else {
            locationMatches.push(space);
          }
        });
      } else {
        // No attribute filters - all spaces are "perfect matches"
        perfectMatches = results;
        locationMatches = [];
      }

      // Sorting function
      const sortSpaces = (spaces: typeof results) => {
        return [...spaces].sort((a, b) => {
          // Promoted spaces first
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          
          // Then by sort option
          if (sortOption === "priceAsc")
            return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
          if (sortOption === "priceDesc")
            return (b.minPrice ?? 0) - (a.minPrice ?? 0);
          if (sortOption === "newest")
            return (
              new Date(b.publishedDate || 0).getTime() -
              new Date(a.publishedDate || 0).getTime()
            );
          if (sortOption === "ratingDesc")
            return (b.avgRating || 0) - (a.avgRating || 0);
          if (sortOption === "ratingAsc")
            return (a.avgRating || 0) - (b.avgRating || 0);
          return 0; // Relevance
        });
      };

      setPerfectMatches(sortSpaces(perfectMatches));
      setLocationMatches(sortSpaces(locationMatches));

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch search results"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    perfectMatches,
    locationMatches,
    loading,
    error,
    fetchSpaces,
  };
};
