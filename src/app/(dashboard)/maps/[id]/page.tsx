'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MarkerDoc } from '@/types';
import MarkerList from '@/components/editor/MarkerList';
import MarkerForm from '@/components/editor/MarkerForm';
import LocationSearch from '@/components/editor/LocationSearch';
import { useMapStore } from '@/lib/store';
import { getMapById } from '@/lib/mapService';
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
  params: Promise<{
    id: string;
  }>;
}

export default function MapEditorPage({ params }: MapEditorPageProps) {
  const [markers, setMarkers] = useState<MarkerDoc[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [showMarkerForm, setShowMarkerForm] = useState(false);
  const [editingMarker, setEditingMarker] = useState<MarkerDoc | undefined>();
  const [pendingPosition, setPendingPosition] = useState<{ lat: number; lng: number; address?: string } | undefined>();
  const [pendingColor, setPendingColor] = useState<string>('#ef4444'); // Default red
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const { setMapCenter, setMapZoom, setMapTitle, mapTitle, mapCenter } = useMapStore();
  
  // Unwrap params using React.use()
  const { id } = React.use(params);

  // Load map data from database
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoadingMap(true);
        setMapError(null);
        console.log('Loading map data for ID:', id);
        
        const mapData = await getMapById(id);
        if (mapData) {
          // Set map title
          setMapTitle(mapData.title);
          
          // Set map center and zoom based on main location
          if (mapData.mainLocation) {
            setMapCenter([mapData.mainLocation.lat, mapData.mainLocation.lng]);
            setMapZoom(16);
          } else {
            // No main location, use default
            setMapCenter([51.505, -0.09]); // London default
            setMapZoom(16);
          }
          
          console.log('Map data loaded successfully:', mapData);
        } else {
          // Map not found
          console.error('Map not found:', id);
          setMapError('Map not found');
          setMapTitle('Map Not Found');
          setMapCenter([51.505, -0.09]);
          setMapZoom(16);
        }
      } catch (error) {
        console.error('Error loading map data:', error);
        setMapError('Failed to load map');
        setMapTitle(`Map ${id}`);
        setMapCenter([51.505, -0.09]);
        setMapZoom(16);
      } finally {
        setIsLoadingMap(false);
      }
    };

    loadMapData();
  }, [id, setMapCenter, setMapZoom, setMapTitle]);

  const handleMapClick = useCallback((e: any) => {
    const { lat, lng } = e.latlng;
    // If there's already a pending position, replace it with the clicked location
    setPendingPosition({ lat, lng });
    setEditingMarker(undefined);
    setShowMarkerForm(true);
    setPendingColor('#ef4444'); // Reset to default color for new marker
  }, []);

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    // Set the pending position for the marker form
    setPendingPosition(location);
    setEditingMarker(undefined);
    setShowMarkerForm(true);
    setPendingColor('#ef4444'); // Reset to default color for new marker
    
    // Move the map to the selected location
    setMapCenter([location.lat, location.lng]);
    setMapZoom(16); // Zoom in for better detail
  }, [setMapCenter, setMapZoom]);

  const handleColorChange = useCallback((color: string) => {
    setPendingColor(color);
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
      icon: data.color ? {
        library: 'default' as const,
        name: 'marker',
        color: data.color,
      } : undefined,
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
    setPendingPosition(undefined); // Clear pending position only after saving
    setPendingColor('#ef4444'); // Reset to default color
  }, [editingMarker]);

  const handleMarkerEdit = useCallback((marker: MarkerDoc) => {
    setEditingMarker(marker);
    setShowMarkerForm(true);
    setPendingPosition(undefined);
    setPendingColor(marker.icon?.color || '#ef4444'); // Use marker's existing color or default
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
      {isLoadingMap ? (
        // Loading State
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      ) : mapError ? (
        // Error State
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Error loading map</h3>
            <p className="mt-1 text-sm text-gray-500">{mapError}</p>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Map Editor Content
        <>
          {/* Left Panel - Marker List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">{mapTitle}</h1>
              
              {/* Location Search */}
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Search to add marker..."
                mapCenter={
                  mapCenter && Array.isArray(mapCenter) 
                    ? { lat: mapCenter[0], lng: mapCenter[1] } 
                    : undefined
                }
              />
              
              {/* Clear pending marker button - only show if there's a pending position */}
              {pendingPosition && !showMarkerForm && (
                <button
                  onClick={() => {
                    setPendingPosition(undefined);
                    setPendingColor('#ef4444'); // Reset color
                  }}
                  className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear pending marker
                </button>
              )}
              
              {/* Add Marker Button */}
              <button
                onClick={() => {
                  // Use current map center or default to current position
                  const defaultPos = mapCenter && Array.isArray(mapCenter) 
                    ? { lat: mapCenter[0], lng: mapCenter[1] }
                    : { lat: 51.505, lng: -0.09 }; // Fallback to London
                  setPendingPosition(defaultPos);
                  setEditingMarker(undefined);
                  setShowMarkerForm(true);
                  setPendingColor('#ef4444'); // Reset to default color for new marker
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
                  // Keep pendingPosition so the marker stays visible on the map
                }}
                defaultPosition={pendingPosition}
                onColorChange={handleColorChange}
              />
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="flex-1">
            <MapCanvas
              onMapClick={handleMapClick}
              className="h-full"
              markers={markers}
              pendingPosition={pendingPosition}
              pendingColor={pendingColor}
            />
          </div>
        </>
      )}
    </div>
  );
}
