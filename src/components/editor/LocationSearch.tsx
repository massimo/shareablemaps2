'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useLocationSearch } from '@/lib/osm';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationCandidate } from '@/types';

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  mapCenter?: { lat: number; lng: number };
}

export default function LocationSearch({ onLocationSelect, placeholder = "Search for a location...", mapCenter }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const { searchLocations } = useLocationSearch();
  const { position } = useGeolocation();

  // Prioritize map center over user location for proximity sorting
  const proximityLocation = React.useMemo(() => {
    if (mapCenter) {
      return mapCenter;
    }
    if (position) {
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    }
    return undefined;
  }, [mapCenter, position]);

  // Debounced search function
  const performSearch = React.useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchLocations(searchQuery, 10, proximityLocation);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Location search error:', error);
        setResults([]);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    },
    [searchLocations, proximityLocation]
  );

  // Debounce search
  React.useEffect(() => {
    // Don't search if user just selected a location
    if (hasSelectedLocation) {
      return;
    }
    
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch, hasSelectedLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHasSelectedLocation(false); // Reset selection state when user types
  };

  const handleLocationSelect = (location: LocationCandidate) => {
    onLocationSelect({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: location.display_name,
    });
    setQuery(location.display_name);
    setShowResults(false);
    setResults([]); // Clear results to prevent reopening
    setHasSelectedLocation(true); // Mark that a location was selected
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
          {results.map((location) => (
            <button
              key={location.place_id}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center"
              onClick={() => handleLocationSelect(location)}
            >
              <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-900 truncate block">{location.display_name}</span>
                {location.distance !== undefined && (
                  <span className="text-xs text-gray-500">
                    {location.distance < 1 
                      ? `${Math.round(location.distance * 1000)}m away`
                      : `${location.distance.toFixed(1)}km away`
                    }
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
