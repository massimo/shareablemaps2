'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface LocationCandidate {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  place_id: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
}

export default function LocationSearch({ onLocationSelect, placeholder = "Search for a location..." }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const searchLocations = React.useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        // TODO: Replace with actual API call to /api/search/poi
        // For now, using mock data
        const mockResults: LocationCandidate[] = [
          {
            display_name: `${searchQuery} - Mock Location 1`,
            lat: '51.505',
            lon: '-0.09',
            type: 'city',
            importance: 0.8,
            place_id: '1',
          },
          {
            display_name: `${searchQuery} - Mock Location 2`,
            lat: '40.7128',
            lon: '-74.0060',
            type: 'city',
            importance: 0.7,
            place_id: '2',
          },
        ];
        
        setResults(mockResults);
        setShowResults(true);
      } catch (error) {
        console.error('Location search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchLocations]);

  const handleLocationSelect = (location: LocationCandidate) => {
    onLocationSelect({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: location.display_name,
    });
    setQuery(location.display_name);
    setShowResults(false);
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
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(results.length > 0)}
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
              <span className="text-sm text-gray-900 truncate">{location.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
