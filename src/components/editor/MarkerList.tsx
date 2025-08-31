'use client';

import React from 'react';
import { TrashIcon, PencilIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { MarkerDoc } from '@/types';
import { getCategoryById } from '@/lib/categories';

interface MarkerListProps {
  markers: MarkerDoc[];
  onMarkerEdit: (marker: MarkerDoc) => void;
  onMarkerDelete: (markerId: string) => void;
  onMarkerSelect: (marker: MarkerDoc) => void;
  selectedMarkerId?: string;
}

export default function MarkerList({
  markers,
  onMarkerEdit,
  onMarkerDelete,
  onMarkerSelect,
  selectedMarkerId,
}: MarkerListProps) {
  if (markers.length === 0) {
    return (
      <div className="p-4 text-center">
        <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No markers yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Click on the map or search for a location to add your first marker.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {markers.map((marker) => (
        <div
          key={marker.id}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedMarkerId === marker.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => onMarkerSelect(marker)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {marker.title}
                </h4>
              </div>
              {marker.categoryId && (
                <div className="mt-1 flex items-center">
                  <span className="text-sm mr-1" role="img">
                    {getCategoryById(marker.categoryId)?.icon}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getCategoryById(marker.categoryId)?.name}
                  </span>
                </div>
              )}
              {marker.address && (
                <p className="mt-1 text-xs text-gray-500 truncate">
                  {marker.address}
                </p>
              )}
              {marker.description && (
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {marker.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkerEdit(marker);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                aria-label="Edit marker"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (marker.id) {
                    onMarkerDelete(marker.id);
                  }
                }}
                className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                aria-label="Delete marker"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
