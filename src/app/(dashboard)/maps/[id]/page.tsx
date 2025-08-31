'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { MarkerDoc } from '@/types';
import MarkerList from '@/components/editor/MarkerList';
import MarkerForm from '@/components/editor/MarkerForm';
import LocationSearch from '@/components/editor/LocationSearch';
import { useMapStore } from '@/lib/store';
import { PlusIcon, MapIcon } from '@heroicons/react/24/outline';

// Dynamically import MapCanvas to avoid SSR issues with Leaflet
const MapCanvas = dynamic(() => import('@/components/editor/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface MapEditorPageProps {
  params: {
    id: string;
  };
}

export default function MapEditorPage({ params }: MapEditorPageProps) {
  const searchParams = useSearchParams();
  const [markers, setMarkers] = useState<MarkerDoc[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [showMarkerForm, setShowMarkerForm] = useState(false);
  const [editingMarker, setEditingMarker] = useState<MarkerDoc | undefined>();
  const [pendingPosition, setPendingPosition] = useState<{ lat: number; lng: number } | undefined>();

  const { setMapCenter, setMapZoom, setMapTitle, mapTitle } = useMapStore();

  // Initialize map with URL parameters
  useEffect(() => {
    // Get parameters from URL
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');
    const city = searchParams.get('city');
    const title = searchParams.get('title');
    
    // Set map title if provided, otherwise use default
    const displayTitle = title ? decodeURIComponent(title) : `Map ${params.id}`;
    setMapTitle(displayTitle);
    
    // Set map center and zoom if coordinates are provided
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        setMapCenter([latitude, longitude]);
        
        // Set zoom level (default to 12 if not provided or invalid)
        const zoomLevel = zoom ? parseInt(zoom, 10) : 12;
        if (!isNaN(zoomLevel) && zoomLevel >= 1 && zoomLevel <= 18) {
          setMapZoom(zoomLevel);
        } else {
          setMapZoom(12);
        }
      }
    }
  }, [searchParams, params.id, setMapCenter, setMapZoom, setMapTitle]);

  const handleMapClick = useCallback((e: any) => {
    const { lat, lng } = e.latlng;
    setPendingPosition({ lat, lng });
    setEditingMarker(undefined);
    setShowMarkerForm(true);
  }, []);

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    setPendingPosition(location);
    setEditingMarker(undefined);
    setShowMarkerForm(true);
  }, []);

  const handleMarkerSave = useCallback((data: any) => {
    // TODO: Save to Firebase
    const newMarker: MarkerDoc = {
      id: editingMarker?.id || `marker-${Date.now()}`,
      title: data.title,
      categoryId: data.categoryId,
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      description: data.description,
      tips: data.tips,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: 'current-user', // TODO: Get from auth
    };

    if (editingMarker) {
      setMarkers(prev => prev.map(m => m.id === editingMarker.id ? newMarker : m));
    } else {
      setMarkers(prev => [...prev, newMarker]);
    }

    setShowMarkerForm(false);
    setEditingMarker(undefined);
    setPendingPosition(undefined);
  }, [editingMarker]);

  const handleMarkerEdit = useCallback((marker: MarkerDoc) => {
    setEditingMarker(marker);
    setShowMarkerForm(true);
    setPendingPosition(undefined);
  }, []);

  const handleMarkerDelete = useCallback((markerId: string) => {
    // TODO: Delete from Firebase
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  }, []);

  const handleMarkerSelect = useCallback((marker: MarkerDoc) => {
    setSelectedMarkerId(marker.id);
    // TODO: Center map on marker
  }, []);

  return (
    <div className="h-full flex">
      {/* Left Panel - Marker List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">{mapTitle}</h1>
          
          {/* Location Search */}
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Search to add marker..."
          />
          
          {/* Add Marker Button */}
          <button
            onClick={() => {
              setPendingPosition({ lat: 51.505, lng: -0.09 }); // Default position
              setEditingMarker(undefined);
              setShowMarkerForm(true);
            }}
            className="mt-3 w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Marker
          </button>
        </div>

        {/* Marker List */}
        <div className="flex-1 overflow-auto">
          <MarkerList
            markers={markers}
            onMarkerEdit={handleMarkerEdit}
            onMarkerDelete={handleMarkerDelete}
            onMarkerSelect={handleMarkerSelect}
            selectedMarkerId={selectedMarkerId}
          />
        </div>

        {/* Marker Form */}
        {showMarkerForm && (
          <MarkerForm
            marker={editingMarker}
            onSave={handleMarkerSave}
            onCancel={() => {
              setShowMarkerForm(false);
              setEditingMarker(undefined);
              setPendingPosition(undefined);
            }}
            defaultPosition={pendingPosition}
          />
        )}
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1">
        <MapCanvas
          onMapClick={handleMapClick}
          className="h-full"
        />
      </div>
    </div>
  );
}
