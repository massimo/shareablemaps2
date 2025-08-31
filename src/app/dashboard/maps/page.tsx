'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapIcon, 
  EyeIcon, 
  ChatBubbleLeftIcon, 
  HeartIcon,
  EllipsisVerticalIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import CreateMapModal from '@/components/maps/CreateMapModal';
import ShareModal, { ShareSettings } from '@/components/maps/ShareModal';
import GlobeView from '@/components/maps/GlobeView';
import { useUserMaps } from '@/hooks/useUserMaps';
import { SharedMapService } from '@/lib/sharedMapService';
import { deleteMap } from '@/lib/mapService';

export default function MyMapsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [selectedMapTitle, setSelectedMapTitle] = useState<string>('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { maps, isLoading, error, refetch } = useUserMaps();

  const handleCreateMap = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    // Refresh maps list after creating a new map
    refetch();
  };

  const handleDropdownToggle = (mapId: string) => {
    setOpenDropdownId(openDropdownId === mapId ? null : mapId);
  };

  const handleShare = (mapId: string, mapTitle: string) => {
    setSelectedMapId(mapId);
    setSelectedMapTitle(mapTitle);
    setShowShareModal(true);
    setOpenDropdownId(null);
  };

  const handleDelete = (mapId: string, mapTitle: string) => {
    setSelectedMapId(mapId);
    setSelectedMapTitle(mapTitle);
    setShowDeleteConfirm(true);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMap(selectedMapId);
      setShowDeleteConfirm(false);
      refetch(); // Refresh the maps list
    } catch (error) {
      console.error('Error deleting map:', error);
      alert('Failed to delete map. Please try again.');
    }
  };

  const handleShareSave = async (shareSettings: ShareSettings) => {
    try {
      await SharedMapService.updateShareSettings(selectedMapId, shareSettings);
      console.log('Share settings saved:', shareSettings);
      refetch(); // Refresh to show updated privacy badge
    } catch (error) {
      console.error('Error saving share settings:', error);
      throw error;
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
            <div key={map.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 relative">
              {/* 3-Dots Menu - Outside of Link */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropdownToggle(map.id!);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                </button>
                
                {/* Dropdown Menu */}
                {openDropdownId === map.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(map.id!, map.title);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ShareIcon className="h-4 w-4 mr-3" />
                        Share
                      </button>
                      <Link 
                        href={`/dashboard/maps/${map.id}`}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PencilIcon className="h-4 w-4 mr-3" />
                        Edit
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(map.id!, map.title);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link href={`/dashboard/maps/${map.id}`}>
                <div className="p-6">
                  {/* Header with Title and Privacy Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1 mr-12">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {map.title}
                      </h3>
                      {map.mainLocation?.city && (
                        <p className="text-sm text-gray-500 truncate">
                          📍 {map.mainLocation.city}
                        </p>
                      )}
                    </div>
                    
                    {/* Privacy Badge - Positioned to avoid 3-dots menu */}
                    <div className="flex-shrink-0 mr-10">
                      {map.shareSettings?.isEnabled && map.shareSettings.shareType !== 'private' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <GlobeAltIcon className="h-3 w-3 mr-1" />
                          {map.shareSettings.shareType === 'password' ? 'Protected' : 'Public'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <LockClosedIcon className="h-3 w-3 mr-1" />
                          Private
                        </span>
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

      {/* 3D Globe View */}
      {!isLoading && maps.length > 0 && (
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">3D Globe View</h2>
            <p className="mt-1 text-sm text-gray-500">
              Explore your maps on an interactive 3D globe
            </p>
          </div>
          <GlobeView 
            maps={maps}
            className="rounded-lg border border-gray-200"
          />
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

      {/* Share Modal */}
      {showShareModal && selectedMapId && (
        <ShareModal
          mapId={selectedMapId}
          mapTitle={selectedMapTitle}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedMapId('');
            setSelectedMapTitle('');
          }}
          onSave={handleShareSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Map
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{selectedMapTitle}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedMapId('');
                    setSelectedMapTitle('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
