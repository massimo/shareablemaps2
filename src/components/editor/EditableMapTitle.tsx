'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useMapStore } from '@/lib/store';
import { updateMapTitle } from '@/lib/mapService';

interface EditableMapTitleProps {
  mapId: string;
}

export default function EditableMapTitle({ mapId }: EditableMapTitleProps) {
  const router = useRouter();
  const { mapTitle, setMapTitle } = useMapStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(mapTitle);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update edit value when map title changes
  useEffect(() => {
    setEditValue(mapTitle);
  }, [mapTitle]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(mapTitle);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditValue(mapTitle);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmedTitle = editValue.trim();
    
    if (!trimmedTitle) {
      handleCancelEdit();
      return;
    }

    try {
      setIsSaving(true);
      
      // Update the local store immediately for responsiveness
      setMapTitle(trimmedTitle);
      setIsEditing(false);
      
      // Save to Firebase database
      await updateMapTitle(mapId, trimmedTitle);
      
      console.log('Map title saved successfully:', { mapId, title: trimmedTitle });
      
    } catch (error) {
      console.error('Error saving map title:', error);
      // Revert on error
      setMapTitle(mapTitle);
      setEditValue(mapTitle);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleBackToMaps = () => {
    router.push('/dashboard/maps');
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Back Button */}
      <button
        onClick={handleBackToMaps}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Back to My Maps"
        title="Back to My Maps"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>

      {/* Editable Title */}
      <div className="flex items-center min-w-0 flex-1">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
              placeholder="Enter map name..."
              disabled={isSaving}
            />
            
            <div className="flex items-center space-x-1">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editValue.trim()}
                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                aria-label="Save title"
                title="Save title"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                aria-label="Cancel editing"
                title="Cancel editing"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {mapTitle}
            </h1>
            
            <button
              onClick={handleStartEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Edit map title"
              title="Edit map title"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
