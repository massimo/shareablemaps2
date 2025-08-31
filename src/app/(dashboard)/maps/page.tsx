'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapIcon, EyeIcon, ChatBubbleLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import CreateMapModal from '@/components/maps/CreateMapModal';
import { useUserMaps } from '@/hooks/useUserMaps';

export default function MyMapsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { maps, isLoading, error, refetch } = useUserMaps();

  const handleCreateMap = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    // Refresh maps list after creating a new map
    refetch();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Error loading maps</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-4">
            <button
              onClick={refetch}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Maps</h1>
        <p className="mt-2 text-gray-600">
          Create and manage your custom maps.
        </p>
      </div>

      {/* Create New Map Button */}
      <div className="mb-6">
        <button 
          onClick={handleCreateMap}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Create New Map
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading your maps...</p>
        </div>
      )}

      {/* Maps Grid */}
      {!isLoading && maps.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {maps.map((map) => (
            <div key={map.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <Link href={`/maps/${map.id}`}>
                <div className="p-6">
                  {/* Map Icon */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <MapIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {map.title}
                      </h3>
                      {map.mainLocation?.city && (
                        <p className="text-sm text-gray-500 truncate">
                          📍 {map.mainLocation.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {map.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {map.description}
                    </p>
                  )}

                  {/* Tags */}
                  {map.tags && map.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {map.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {map.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                            +{map.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {map.stats.views}
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-1" />
                        {map.stats.likes}
                      </div>
                      <div className="flex items-center">
                        <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                        {map.stats.comments}
                      </div>
                    </div>
                    <div className="text-xs">
                      {map.updatedAt && new Date(map.updatedAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && maps.length === 0 && (
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No maps yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first interactive map.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreateMap}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create your first map
            </button>
          </div>
        </div>
      )}

      {/* Create Map Modal */}
      <CreateMapModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
      />
    </div>
  );
}
