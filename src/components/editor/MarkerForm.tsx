'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { markerSchema, MarkerForm as MarkerFormType } from '@/lib/validators';
import { MarkerDoc } from '@/types';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface MarkerFormProps {
  marker?: MarkerDoc;
  onSave: (data: { title: string; categoryId?: string; address?: string; description?: string; tips: string[]; lat: number; lng: number; color?: string }) => void;
  onCancel: () => void;
  defaultPosition?: { lat: number; lng: number; address?: string };
  onColorChange?: (color: string) => void;
}

interface FormData {
  title: string;
  categoryId?: string;
  address?: string;
  description?: string;
  tips: string;
  color?: string;
}

export default function MarkerForm({
  marker,
  onSave,
  onCancel,
  defaultPosition,
  onColorChange,
}: MarkerFormProps) {
  // Predefined color palette
  const colorOptions = [
    { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Green', value: '#10b981', bg: 'bg-emerald-500' },
    { name: 'Yellow', value: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Purple', value: '#8b5cf6', bg: 'bg-violet-500' },
    { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
    { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
    { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
    { name: 'Gray', value: '#6b7280', bg: 'bg-gray-500' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: marker ? {
      title: marker.title,
      categoryId: marker.categoryId || '',
      address: marker.address || '',
      description: marker.description || '',
      tips: marker.tips?.join('\n') || '',
      color: marker.icon?.color || colorOptions[0].value,
    } : {
      title: '',
      categoryId: '',
      address: defaultPosition?.address || '',
      description: '',
      tips: '',
      color: colorOptions[0].value, // Default to red
    },
  });

  const selectedColor = watch('color');

  const handleColorSelect = (color: string) => {
    setValue('color', color);
    onColorChange?.(color);
  };

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
      color: data.color,
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

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marker Color
          </label>
          <div className="space-y-3">
            {/* Color Options */}
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={`
                    relative w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${selectedColor === color.value 
                      ? 'border-gray-800 ring-2 ring-gray-300' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${color.bg}
                  `}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Color Preview */}
            {selectedColor && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative">
                  <svg 
                    className="w-6 h-6 drop-shadow-sm"
                    style={{ 
                      filter: selectedColor === '#ef4444' ? 'hue-rotate(0deg) brightness(1) saturate(1.5)' :
                              selectedColor === '#3b82f6' ? 'hue-rotate(220deg) brightness(1.1) saturate(1.3)' :
                              selectedColor === '#10b981' ? 'hue-rotate(140deg) brightness(1.1) saturate(1.4)' :
                              selectedColor === '#f59e0b' ? 'hue-rotate(35deg) brightness(1.2) saturate(1.5)' :
                              selectedColor === '#8b5cf6' ? 'hue-rotate(260deg) brightness(1.1) saturate(1.3)' :
                              selectedColor === '#ec4899' ? 'hue-rotate(320deg) brightness(1.2) saturate(1.4)' :
                              selectedColor === '#f97316' ? 'hue-rotate(25deg) brightness(1.1) saturate(1.5)' :
                              selectedColor === '#14b8a6' ? 'hue-rotate(175deg) brightness(1.1) saturate(1.4)' :
                              selectedColor === '#6366f1' ? 'hue-rotate(235deg) brightness(1.1) saturate(1.3)' :
                              selectedColor === '#6b7280' ? 'grayscale(1) brightness(0.8)' : 'none'
                    }}
                    viewBox="0 0 24 24" 
                    fill="#2563eb"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Preview: {colorOptions.find(c => c.value === selectedColor)?.name || 'Custom'} Marker
                  </p>
                  <p className="text-xs text-gray-500">This is how your marker will appear on the map</p>
                </div>
              </div>
            )}
          </div>
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
