'use client';

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { MarkerDoc } from '@/types';
import { MARKER_CATEGORIES } from '@/lib/categories';

interface MarkerSearchProps {
  markers: MarkerDoc[];
  onMarkerSelect: (marker: MarkerDoc) => void;
  className?: string;
}

export default function MarkerSearch({ markers, onMarkerSelect, className = '' }: MarkerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredMarkers = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    return markers.filter(marker => {
      // Search in title
      if (marker.title.toLowerCase().includes(term)) return true;
      
      // Search in description
      if (marker.description?.toLowerCase().includes(term)) return true;
      
      // Search in address
      if (marker.address?.toLowerCase().includes(term)) return true;
      
      // Search in category name
      if (marker.categoryId) {
        const category = MARKER_CATEGORIES.find(cat => cat.id === marker.categoryId);
        if (category?.name.toLowerCase().includes(term)) return true;
      }
      
      // Search in tips
      if (marker.tips && Array.isArray(marker.tips)) {
        return marker.tips.some(tip => tip.toLowerCase().includes(term));
      }
      
      return false;
    }).slice(0, 10); // Limit to 10 results
  }, [markers, searchTerm]);

  const handleMarkerClick = (marker: MarkerDoc) => {
    onMarkerSelect(marker);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search markers..."
          className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && searchTerm.trim() && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Results Dropdown */}
          <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            {filteredMarkers.length > 0 ? (
              <div className="py-2">
                {filteredMarkers.map((marker) => {
                  const category = marker.categoryId 
                    ? MARKER_CATEGORIES.find(cat => cat.id === marker.categoryId)
                    : null;
                  
                  return (
                    <button
                      key={marker.id}
                      onClick={() => handleMarkerClick(marker)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {category ? (
                            <span className="text-lg">{category.icon}</span>
                          ) : (
                            <div className="w-5 h-5 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {marker.title}
                          </h4>
                          {marker.address && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {marker.address}
                            </p>
                          )}
                          {category && (
                            <p className="text-xs text-gray-400 mt-1">
                              {category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No markers found for "{searchTerm}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
