'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { markerSchema, MarkerForm as MarkerFormType } from '@/lib/validators';
import { MarkerDoc } from '@/types';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface MarkerFormProps {
  marker?: MarkerDoc;
  onSave: (data: { title: string; categoryId?: string; address?: string; description?: string; tips: string[]; lat: number; lng: number }) => void;
  onCancel: () => void;
  defaultPosition?: { lat: number; lng: number; address?: string };
}

interface FormData {
  title: string;
  categoryId?: string;
  address?: string;
  description?: string;
  tips: string;
}

export default function MarkerForm({
  marker,
  onSave,
  onCancel,
  defaultPosition,
}: MarkerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: marker ? {
      title: marker.title,
      categoryId: marker.categoryId || '',
      address: marker.address || '',
      description: marker.description || '',
      tips: marker.tips?.join('\n') || '',
    } : {
      title: '',
      categoryId: '',
      address: defaultPosition?.address || '',
      description: '',
      tips: '',
    },
  });

  const onSubmit = (data: FormData) => {
    const position = marker ? { lat: marker.lat, lng: marker.lng } : defaultPosition;
    if (!position) {
      console.error('No position provided for marker');
      return;
    }
    
    onSave({
      ...data,
      tips: data.tips ? data.tips.split('\n').map(tip => tip.trim()).filter(Boolean) : [],
      lat: position.lat,
      lng: position.lng,
    });
  };

  return (
    <div className="bg-white p-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {marker ? 'Edit Marker' : 'Add New Marker'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          aria-label="Close form"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            {...register('title')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            placeholder="Enter marker title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            {...register('address')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            placeholder="Enter address (optional)"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            placeholder="Describe this location..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Tips */}
        <div>
          <label htmlFor="tips" className="block text-sm font-medium text-gray-700">
            Tips
          </label>
          <textarea
            {...register('tips')}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            placeholder="Add tips (one per line)..."
          />
          <p className="mt-1 text-xs text-gray-500">Enter each tip on a new line</p>
          {errors.tips && (
            <p className="mt-1 text-sm text-red-600">{errors.tips.message}</p>
          )}
        </div>

        {/* Images Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Image upload coming soon
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : marker ? 'Update Marker' : 'Add Marker'}
          </button>
        </div>
      </form>
    </div>
  );
}
