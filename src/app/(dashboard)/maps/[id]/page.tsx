'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet'; // Import Leaflet for map reference type
import { Timestamp } from 'firebase/firestore';
import { MarkerDoc } from '@/types';
import MarkerList from '@/components/editor/MarkerList';
import MarkerForm from '@/components/editor/MarkerForm';
import LocationSearch from '@/components/editor/LocationSearch';
import AddMarkerConfirmModal from '@/components/editor/AddMarkerConfirmModal';
import { useMapStore } from '@/lib/store';
import { getMapById } from '@/lib/mapService';
import { MarkerService } from '@/lib/markerService';
import { auth } from '@/lib/firebase';
import { MapIcon } from '@heroicons/react/24/outline';

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
  const [showAddMarkerConfirm, setShowAddMarkerConfirm] = useState(false);
  const [editingMarker, setEditingMarker] = useState<MarkerDoc | undefined>();
  const [pendingPosition, setPendingPosition] = useState<{ lat: number; lng: number; address?: string } | undefined>();
  const [pendingColor, setPendingColor] = useState<string>('#ef4444'); // Default red
  const [pendingMarkerType, setPendingMarkerType] = useState<'pin' | 'circle'>('pin'); // Default pin
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = React.useRef<L.Map | null>(null); // Add map reference for programmatic control
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null); // For handling click delay

  const { setMapCenter, setMapZoom, setMapTitle, mapTitle, mapCenter } = useMapStore();
  
  // Unwrap params using React.use()
  const { id } = React.use(params);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

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
          
          // Load markers for this map
          console.log('Loading markers for map:', id);
          const markersData = await MarkerService.getMarkersByMapId(id);
          setMarkers(markersData);
          console.log('Markers loaded successfully:', markersData.length, 'markers');
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
        
        // Try to load markers even if map loading failed
        try {
          console.log('Attempting to load markers despite map error...');
          const markersData = await MarkerService.getMarkersByMapId(id);
          setMarkers(markersData);
          console.log('Markers loaded despite map error:', markersData.length, 'markers');
        } catch (markerError) {
          console.warn('Could not load markers:', markerError);
          setMarkers([]);
        }
      } finally {
        setIsLoadingMap(false);
      }
    };

    loadMapData();
  }, [id, setMapCenter, setMapZoom, setMapTitle]);

  // Separate effect to refresh markers periodically
  useEffect(() => {
    const refreshMarkers = async () => {
      if (!id) return;
      
      try {
        console.log('Refreshing markers for map:', id);
        const markersData = await MarkerService.getMarkersByMapId(id);
        setMarkers(markersData);
        console.log('Markers refreshed:', markersData.length, 'markers found');
      } catch (error) {
        console.warn('Failed to refresh markers:', error);
      }
    };

    // Refresh markers when component mounts and every 30 seconds
    refreshMarkers();
    const interval = setInterval(refreshMarkers, 30000);

    return () => clearInterval(interval);
  }, [id]);

  const handleMapClick = useCallback((e: { lat: number; lng: number }) => {
    console.log('Map clicked at:', e.lat, e.lng);
    
    // Clear any existing timeout to handle double-click detection
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      return; // This was a double-click, let Leaflet handle zoom
    }
    
    // Set a timeout for single-click detection
    clickTimeoutRef.current = setTimeout(() => {
      console.log('Single click confirmed, showing add marker confirmation');
      
      // Set pending position and show confirmation modal
      setPendingPosition({ lat: e.lat, lng: e.lng });
      setShowAddMarkerConfirm(true);
      setEditingMarker(undefined);
      setPendingColor('#ef4444'); // Reset to default color for new marker
      setPendingMarkerType('pin'); // Reset to default marker type for new marker
      
      clickTimeoutRef.current = null;
    }, 250); // 250ms delay to detect double-click
  }, []);

  const handleAddMarkerConfirm = useCallback(() => {
    setShowAddMarkerConfirm(false);
    setShowMarkerForm(true);
  }, []);

  const handleAddMarkerCancel = useCallback(() => {
    setShowAddMarkerConfirm(false);
    setPendingPosition(undefined);
    setPendingColor('#ef4444'); // Reset color
    setPendingMarkerType('pin'); // Reset marker type
  }, []);

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    // Set the pending position and show confirmation modal
    setPendingPosition(location);
    setShowAddMarkerConfirm(true);
    setEditingMarker(undefined);
    setPendingColor('#ef4444'); // Reset to default color for new marker
    setPendingMarkerType('pin'); // Reset to default marker type for new marker
    
    // Move the map to the selected location
    setMapCenter([location.lat, location.lng]);
    setMapZoom(16); // Zoom in for better detail
  }, [setMapCenter, setMapZoom]);

  const handleColorChange = useCallback((color: string) => {
    setPendingColor(color);
  }, []);

  const handleMarkerTypeChange = useCallback((markerType: 'pin' | 'circle') => {
    setPendingMarkerType(markerType);
  }, []);

  const handleRefreshMarkers = useCallback(async () => {
    try {
      console.log('Manually refreshing markers for map:', id);
      const markersData = await MarkerService.getMarkersByMapId(id);
      setMarkers(markersData);
      console.log('Manual refresh complete:', markersData.length, 'markers loaded');
    } catch (error) {
      console.error('Failed to refresh markers:', error);
      alert('Failed to refresh markers. Please try again.');
    }
  }, [id]);

    const handleMarkerSave = useCallback(async (data: any) => {
    try {
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid || 'anonymous-user'; // Fallback for development

      console.log('Saving marker with data:', data);
      console.log('Current user:', currentUser?.uid || 'anonymous');

      const markerData = {
        mapId: id, // Link marker to this map
        title: data.title,
        categoryId: data.categoryId,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        description: data.description,
        tips: data.tips || [],
        icon: {
          library: 'default' as const,
          name: 'marker',
          color: data.color,
          markerType: data.markerType || 'pin',
        },
        createdBy: userId,
      };

      console.log('Marker data to save:', markerData);

      let savedMarker: MarkerDoc;
      
      if (editingMarker?.id) {
        // Update existing marker
        console.log('Updating existing marker:', editingMarker.id);
        await MarkerService.updateMarker(editingMarker.id, markerData);
        savedMarker = {
          ...markerData,
          id: editingMarker.id,
          createdAt: editingMarker.createdAt,
          updatedAt: Timestamp.now(),
        };
        setMarkers(prev => prev.map(m => m.id === editingMarker.id ? savedMarker : m));
        console.log('Marker updated successfully');
      } else {
        // Create new marker
        console.log('Creating new marker');
        savedMarker = await MarkerService.createMarker(id, markerData);
        setMarkers(prev => [...prev, savedMarker]);
        console.log('Marker created successfully:', savedMarker);
      }

      setShowMarkerForm(false);
      setEditingMarker(undefined);
      setPendingPosition(undefined); // Clear pending position after saving
      setPendingColor('#ef4444'); // Reset to default color
      setPendingMarkerType('pin'); // Reset to default marker type
    } catch (error) {
      console.error('Error saving marker:', error);
      const err = error as any;
      console.error('Full error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      // TODO: Show error toast/notification
      alert(`Failed to save marker: ${err.message || 'Unknown error'}`);
    }
  }, [editingMarker, id]);

  const handleMarkerEdit = useCallback((marker: MarkerDoc) => {
    setEditingMarker(marker);
    setShowMarkerForm(true);
    setPendingPosition(undefined);
    setPendingColor(marker.icon?.color || '#ef4444'); // Use marker's existing color or default
    setPendingMarkerType(marker.icon?.markerType || 'pin'); // Use marker's existing type or default
  }, []);

  const handleMarkerDelete = useCallback(async (markerId: string) => {
    try {
      // Try to delete from Firebase first
      await MarkerService.deleteMarker(markerId);
      setMarkers(prev => prev.filter(m => m.id !== markerId));
      console.log('Marker deleted from Firebase successfully');
    } catch (firebaseError) {
      console.warn('Firebase delete failed, removing locally:', firebaseError);
      // Fall back to local removal if Firebase isn't configured
      setMarkers(prev => prev.filter(m => m.id !== markerId));
    }
  }, []);

  const handleMarkerSelect = useCallback((marker: MarkerDoc) => {
    setSelectedMarkerId(marker.id);
    
    // Center and zoom to the selected marker with smooth animation
    if (mapRef.current && marker.lat && marker.lng) {
      console.log('Centering map on marker:', marker.title, `(${marker.lat}, ${marker.lng})`);
      
      // Animate to marker position with a nice zoom level
      mapRef.current.flyTo([marker.lat, marker.lng], 16, {
        animate: true,
        duration: 1.5, // 1.5 seconds animation
      });
    }
  }, []);

  // Handle map ready callback to store map reference
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    console.log('Map instance ready and stored in ref');
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
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-900">{mapTitle}</h1>
                <button
                  onClick={handleRefreshMarkers}
                  className="text-xs text-gray-500 hover:text-gray-700 underline flex items-center"
                  title="Refresh markers from database"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
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
              {pendingPosition && !showMarkerForm && !showAddMarkerConfirm && (
                <button
                  onClick={() => {
                    setPendingPosition(undefined);
                    setPendingColor('#ef4444'); // Reset color
                    setPendingMarkerType('pin'); // Reset marker type
                  }}
                  className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear pending marker
                </button>
              )}
            </div>

            {/* Marker List */}
            <div className="flex-1 overflow-auto">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <p className="text-xs text-gray-600">
                  {markers.length} marker{markers.length !== 1 ? 's' : ''} on this map
                </p>
              </div>
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
                onMarkerTypeChange={handleMarkerTypeChange}
              />
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="flex-1">
            <MapCanvas
              onMapClick={handleMapClick}
              onMapReady={handleMapReady}
              className="h-full"
              markers={markers}
              pendingPosition={pendingPosition}
              pendingColor={pendingColor}
              pendingMarkerType={pendingMarkerType}
              selectedMarkerId={selectedMarkerId}
            />
          </div>
        </>
      )}

      {/* Add Marker Confirmation Modal */}
      <AddMarkerConfirmModal
        isOpen={showAddMarkerConfirm}
        onClose={handleAddMarkerCancel}
        onConfirm={handleAddMarkerConfirm}
        position={pendingPosition}
      />
    </div>
  );
}
