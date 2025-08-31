'use client';

import React, { useState } from 'react';
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  TagIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { MARKER_CATEGORIES, Category } from '@/lib/categories';

interface MarkerCardProps {
  marker: {
    id?: string;
    title: string;
    categoryId?: string;
    description?: string;
    tips?: string | string[];
    address?: string;
    images?: string[];
    lat: number;
    lng: number;
  };
  onClose: () => void;
  onDirections: (lat: number, lng: number, title: string) => void;
  className?: string;
}

export default function MarkerCard({ marker, onClose, onDirections, className = '' }: MarkerCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const category = marker.categoryId ? MARKER_CATEGORIES.find((cat: Category) => cat.id === marker.categoryId) : null;
  const hasImages = marker.images && marker.images.length > 0;
  const hasMultipleImages = hasImages && marker.images!.length > 1;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => 
        prev === marker.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? marker.images!.length - 1 : prev - 1
      );
    }
  };

  const handleDirections = () => {
    onDirections(marker.lat, marker.lng, marker.title);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="relative">
        {/* Image Carousel */}
        {hasImages ? (
          <div className="relative h-48 bg-gray-100">
            <img
              src={marker.images![currentImageIndex]}
              alt={marker.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                
                {/* Image Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {marker.images!.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <MapPinIcon className="h-12 w-12 text-blue-500" />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title and Category */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 leading-tight">
            {marker.title}
          </h3>
          
          {category && (
            <div className="flex items-center space-x-2">
              <TagIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 flex items-center space-x-1">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Address */}
        {marker.address && (
          <div className="flex items-start space-x-2">
            <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 leading-relaxed">
              {marker.address}
            </span>
          </div>
        )}

        {/* Description */}
        {marker.description && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <InformationCircleIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">About</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed pl-6">
              {marker.description}
            </p>
          </div>
        )}

        {/* Tips */}
        {marker.tips && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">Tips</span>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed pl-6">
              {Array.isArray(marker.tips) ? (
                <ul className="space-y-1">
                  {marker.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{marker.tips}</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={handleDirections}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            <span>Get Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
