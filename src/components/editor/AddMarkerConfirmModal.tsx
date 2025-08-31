'use client';

import React from 'react';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AddMarkerConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  position?: { lat: number; lng: number; address?: string };
}

export default function AddMarkerConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  position,
}: AddMarkerConfirmModalProps) {
  if (!isOpen || !position) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
      data-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <MapPinIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Add Marker</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Do you want to add a new marker at this location?
          </p>
          
          {/* Location Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <MapPinIcon className="h-3 w-3 mr-1" />
              Location
            </div>
            <p className="text-sm font-mono text-gray-700">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
            {position.address && (
              <p className="text-xs text-gray-600 mt-1">{position.address}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Marker
          </button>
        </div>
      </div>
    </div>
  );
}
