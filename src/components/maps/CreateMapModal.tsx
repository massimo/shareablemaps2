'use client';

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import LocationSearch from '@/components/editor/LocationSearch';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createMap } from '@/lib/mapService';

interface CreateMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateMapFormData {
  title: string;
  description?: string;
  tags?: string;
  cityLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function CreateMapModal({ isOpen, onClose }: CreateMapModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateMapFormData>();

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setValue('cityLocation', location);
  };

  const onSubmit = async (data: CreateMapFormData) => {
    try {
      // Validate required fields
      if (!data.title || data.title.trim().length === 0) {
        return;
      }

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Prepare map data
      const mapData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        mainLocation: selectedLocation ? {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: selectedLocation.address,
          city: selectedLocation.address.split(',')[0]?.trim(), // Extract city from address
        } : undefined,
      };

      // Create map in Firebase
      const { id: mapId, shareId } = await createMap(user.uid, mapData);
      
      console.log('Map created successfully:', {
        mapId,
        shareId,
        data: mapData,
      });

      // Navigate to the new map editor with just the map ID
      router.push(`/dashboard/maps/${mapId}`);
      
      // Close modal and reset form
      handleClose();
    } catch (error) {
      console.error('Error creating map:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedLocation(null);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Create New Map
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Start by giving your map a name and selecting the initial location.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                      {/* Map Name */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                          Map Name *
                        </label>
                        <div className="mt-2">
                          <input
                            {...register('title')}
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Enter map name"
                          />
                          {errors.title && (
                            <p className="mt-2 text-sm text-red-600">Map name is required</p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                          Description
                        </label>
                        <div className="mt-2">
                          <textarea
                            {...register('description')}
                            rows={3}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Describe your map (optional)"
                          />
                          {errors.description && (
                            <p className="mt-2 text-sm text-red-600">Description is too long</p>
                          )}
                        </div>
                      </div>

                      {/* City Location */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                          Starting Location
                        </label>
                        <LocationSearch
                          onLocationSelect={handleLocationSelect}
                          placeholder="Search for a city or location..."
                        />
                        {selectedLocation && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-md">
                            <p className="text-xs text-blue-800">
                              Selected: {selectedLocation.address}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div>
                        <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900">
                          Tags
                        </label>
                        <div className="mt-2">
                          <input
                            {...register('tags')}
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="travel, food, business (comma separated)"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Add tags to help organize your maps
                          </p>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
                        >
                          {isSubmitting ? 'Creating...' : 'Create Map'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                          onClick={handleClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
