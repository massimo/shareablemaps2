'use client';

import React from 'react';
import { 
  XMarkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  title: string;
}

export default function DirectionsModal({ isOpen, onClose, lat, lng, title }: DirectionsModalProps) {
  if (!isOpen) return null;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
    onClose();
  };

  const openAppleMaps = () => {
    const url = `http://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Get Directions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Choose your preferred maps app to get directions to <span className="font-medium">{title}</span>:
          </div>

          {/* Google Maps Option */}
          <button
            onClick={openGoogleMaps}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">G</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Google Maps</div>
                <div className="text-sm text-gray-500">Open in Google Maps</div>
              </div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
          </button>

          {/* Apple Maps Option */}
          <button
            onClick={openAppleMaps}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">🍎</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Apple Maps</div>
                <div className="text-sm text-gray-500">Open in Apple Maps</div>
              </div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
