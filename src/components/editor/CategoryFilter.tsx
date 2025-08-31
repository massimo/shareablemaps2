'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { MARKER_CATEGORIES, getCategoryById } from '@/lib/categories';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  availableCategories: string[]; // Categories that actually exist in the current markers
  hasUncategorizedMarkers: boolean; // Whether there are markers without categories
}

export default function CategoryFilter({
  selectedCategories,
  onCategoriesChange,
  availableCategories,
  hasUncategorizedMarkers,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories to only show those that exist in markers
  const filteredCategories = MARKER_CATEGORIES.filter(category => 
    availableCategories.includes(category.id)
  );

  // Add uncategorized option if there are markers without categories
  const allFilterOptions = hasUncategorizedMarkers 
    ? [...filteredCategories, { id: 'uncategorized', name: 'Uncategorized', icon: '📌', description: 'Markers without a category' }]
    : filteredCategories;

  const totalAvailableOptions = hasUncategorizedMarkers ? availableCategories.length + 1 : availableCategories.length;

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectAll = () => {
    // Include all available categories and uncategorized if it exists
    const allCategories = hasUncategorizedMarkers 
      ? [...availableCategories, 'uncategorized']
      : availableCategories;
    onCategoriesChange(allCategories);
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  const isAllSelected = hasUncategorizedMarkers 
    ? availableCategories.every(cat => selectedCategories.includes(cat)) && selectedCategories.includes('uncategorized')
    : availableCategories.every(cat => selectedCategories.includes(cat)) && selectedCategories.length === availableCategories.length;
  const isNoneSelected = selectedCategories.length === 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md transition-colors ${
          selectedCategories.length > 0 && selectedCategories.length < availableCategories.length
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      >
        <div className="flex items-center">
          <FunnelIcon className="h-4 w-4 mr-2" />
          <span>
            {isNoneSelected ? 'Filter by category' :
             isAllSelected ? 'All categories' :
             `${selectedCategories.length} selected`}
          </span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-hidden">
          {/* Header with controls */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">
                Filter Categories ({filteredCategories.length} available)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  disabled={isAllSelected}
                >
                  All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-600 hover:text-gray-800"
                  disabled={isNoneSelected}
                >
                  None
                </button>
              </div>
            </div>
          </div>

          {/* Category list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                No categories found in current markers
              </div>
            ) : (
              <div className="p-1">
                {filteredCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <span className="text-base mr-2" role="img" aria-label={category.name}>
                          {category.icon}
                        </span>
                        <span className="truncate">{category.name}</span>
                      </div>
                      {isSelected && (
                        <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
