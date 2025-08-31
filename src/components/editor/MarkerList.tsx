'use client';

import React, { useState } from 'react';
import { TrashIcon, PencilIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { MarkerDoc } from '@/types';
import { getCategoryById } from '@/lib/categories';
import ImageViewerModal from './ImageViewerModal';

interface MarkerListProps {
  markers: MarkerDoc[];
  onMarkerEdit: (marker: MarkerDoc) => void;
  onMarkerDelete: (markerId: string) => void;
  onMarkerSelect: (marker: MarkerDoc) => void;
  selectedMarkerId?: string;
  viewMode?: 'expanded' | 'compact';
}

export default function MarkerList({
  markers,
  onMarkerEdit,
  onMarkerDelete,
  onMarkerSelect,
  selectedMarkerId,
  viewMode = 'expanded',
}: MarkerListProps) {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedMarkerTitle, setSelectedMarkerTitle] = useState('');

  const openImageViewer = (images: string[], initialIndex: number = 0, markerTitle: string) => {
    setSelectedImages(images);
    setSelectedImageIndex(initialIndex);
    setSelectedMarkerTitle(markerTitle);
    setImageViewerOpen(true);
  };
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
    <div className={viewMode === 'compact' ? 'space-y-1' : 'space-y-2'}>
      {markers.map((marker) => (
        <div
          key={marker.id}
          className={`${viewMode === 'compact' ? 'p-2' : 'p-3'} rounded-lg border cursor-pointer transition-colors ${
            selectedMarkerId === marker.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => onMarkerSelect(marker)}
        >
          <div className={`flex items-${viewMode === 'compact' ? 'center' : 'start'} justify-between`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                {/* Show colored marker icon */}
                {marker.icon?.color ? (
                  <div className="flex items-center mr-2 flex-shrink-0">
                    {marker.icon.markerType === 'circle' ? (
                      <div
                        className={`${viewMode === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full border-2 border-white shadow-sm`}
                        style={{ backgroundColor: marker.icon.color }}
                        title={`${marker.icon.markerType} marker`}
                      />
                    ) : (
                      <div className={`relative ${viewMode === 'compact' ? 'w-3 h-4' : 'w-4 h-5'}`}>
                        <svg 
                          width={viewMode === 'compact' ? 12 : 16} 
                          height={viewMode === 'compact' ? 15 : 20} 
                          viewBox="0 0 16 20" 
                          className="drop-shadow-sm"
                        >
                          <path
                            d="M8 0C3.6 0 0 3.6 0 8c0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8z"
                            fill={marker.icon.color}
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          <circle cx="8" cy="8" r="2.5" fill="#fff"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <MapPinIcon className={`${viewMode === 'compact' ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400 mr-2 flex-shrink-0`} />
                )}
                <h4 className={`${viewMode === 'compact' ? 'text-sm' : 'text-sm'} font-medium text-gray-900 truncate`}>
                  {marker.title}
                </h4>
              </div>
              
              {/* Only show additional details in expanded view */}
              {viewMode === 'expanded' && (
                <>
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
                  {marker.images && marker.images.length > 0 && (
                    <div className="mt-2 flex space-x-1">
                      {marker.images.slice(0, 3).map((image, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageViewer(marker.images!, index, marker.title);
                          }}
                          className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 hover:ring-2 hover:ring-blue-500 transition-all"
                        >
                          <img
                            src={image}
                            alt={`${marker.title} image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      {marker.images.length > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageViewer(marker.images!, 3, marker.title);
                          }}
                          className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0 hover:bg-gray-300 transition-colors"
                        >
                          <span className="text-xs text-gray-500">+{marker.images.length - 3}</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkerEdit(marker);
                }}
                className={`${viewMode === 'compact' ? 'p-0.5' : 'p-1'} text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600`}
                aria-label="Edit marker"
              >
                <PencilIcon className={`${viewMode === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (marker.id) {
                    onMarkerDelete(marker.id);
                  }
                }}
                className={`${viewMode === 'compact' ? 'p-0.5' : 'p-1'} text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600`}
                aria-label="Delete marker"
              >
                <TrashIcon className={`${viewMode === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        title={selectedMarkerTitle}
      />
    </div>
  );
}
