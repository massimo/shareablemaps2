'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { MarkerDoc } from '@/types';
import MarkerList from '@/components/editor/MarkerList';
import CategoryFilter from '@/components/editor/CategoryFilter';
import MarkerCard from '@/components/maps/MarkerCard';
import DirectionsModal from '@/components/maps/DirectionsModal';
import PasswordModal from '@/components/maps/PasswordModal';
import MarkerSearch from '@/components/maps/MarkerSearch';
import { SharedMapService } from '@/lib/sharedMapService';
import { MarkerService } from '@/lib/markerService';
import { MARKER_CATEGORIES } from '@/lib/categories';
import { MapIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, Squares2X2Icon } from '@heroicons/react/24/outline';

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

interface SharedMapPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SharedMapPage({ params }: SharedMapPageProps) {
  const [id, setId] = useState<string>('');
  const [mapTitle, setMapTitle] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [markers, setMarkers] = useState<MarkerDoc[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [selectedMarker, setSelectedMarker] = useState<MarkerDoc | null>(null);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');
  
  // Access control states
  const [isLoading, setIsLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [accessError, setAccessError] = useState<string>();

  const mapRef = useRef<L.Map | null>(null);

  // Resolve params
  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  // Load shared map data
  useEffect(() => {
    const loadSharedMap = async () => {
      if (!id) return;

      setIsLoading(true);
      setAccessError(undefined);

      try {
        const result = await SharedMapService.getSharedMap(id);
        
        if (!result.accessGranted) {
          if (result.requiresPassword) {
            setRequiresPassword(true);
            setShowPasswordModal(true);
            setMapTitle(result.map?.title || 'Protected Map');
          } else {
            setAccessError(result.error || 'Access denied');
          }
          setIsLoading(false);
          return;
        }

        if (result.map) {
          setMapTitle(result.map.title);
          setAccessGranted(true);
          
          // Set map center and zoom
          if (result.map.mainLocation) {
            setMapCenter([result.map.mainLocation.lat, result.map.mainLocation.lng]);
            setMapZoom(16);
          }

          // Load markers
          const markersData = await MarkerService.getMarkersByMapId(id);
          setMarkers(markersData);

          // Initialize category filter
          const categoriesInMarkers = new Set<string>();
          markersData.forEach(marker => {
            if (marker.categoryId) {
              categoriesInMarkers.add(marker.categoryId);
            }
          });
          const hasUncategorized = markersData.some(marker => !marker.categoryId);
          
          const initialCategories = Array.from(categoriesInMarkers);
          if (hasUncategorized) {
            initialCategories.push('uncategorized');
          }
          setSelectedCategories(initialCategories);
        }
      } catch (error) {
        console.error('Error loading shared map:', error);
        setAccessError('Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedMap();
  }, [id]);

  // Handle password submission
  const handlePasswordSubmit = useCallback(async (password: string) => {
    setPasswordError(undefined);
    
    try {
      const result = await SharedMapService.getSharedMap(id, password);
      
      if (!result.accessGranted) {
        setPasswordError(result.error || 'Incorrect password');
        return;
      }

      if (result.map) {
        setMapTitle(result.map.title);
        setAccessGranted(true);
        setShowPasswordModal(false);
        
        // Set map center and zoom
        if (result.map.mainLocation) {
          setMapCenter([result.map.mainLocation.lat, result.map.mainLocation.lng]);
          setMapZoom(16);
        }

        // Load markers
        const markersData = await MarkerService.getMarkersByMapId(id);
        setMarkers(markersData);

        // Initialize category filter
        const categoriesInMarkers = new Set<string>();
        markersData.forEach(marker => {
          if (marker.categoryId) {
            categoriesInMarkers.add(marker.categoryId);
          }
        });
        const hasUncategorized = markersData.some(marker => !marker.categoryId);
        
        const initialCategories = Array.from(categoriesInMarkers);
        if (hasUncategorized) {
          initialCategories.push('uncategorized');
        }
        setSelectedCategories(initialCategories);
      }
    } catch (error) {
      console.error('Error validating password:', error);
      setPasswordError('Failed to validate password');
    }
  }, [id]);

  const handlePasswordCancel = useCallback(() => {
    setShowPasswordModal(false);
    setAccessError('Access cancelled');
  }, []);

  // Filter markers based on selected categories
  const filteredMarkers = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    
    return markers.filter(marker => {
      if (!marker.categoryId) {
        return selectedCategories.includes('uncategorized');
      }
      return selectedCategories.includes(marker.categoryId);
    });
  }, [markers, selectedCategories]);

  // Get available categories and check for uncategorized markers
  const { availableCategories, hasUncategorizedMarkers } = useMemo(() => {
    const categoriesInMarkers = new Set<string>();
    markers.forEach(marker => {
      if (marker.categoryId) {
        categoriesInMarkers.add(marker.categoryId);
      }
    });
    
    const available = Array.from(categoriesInMarkers); // Just the category IDs
    const hasUncategorized = markers.some(marker => !marker.categoryId);
    
    return {
      availableCategories: available,
      hasUncategorizedMarkers: hasUncategorized
    };
  }, [markers]);

  // Marker selection handlers
  const handleMarkerSelect = useCallback((marker: MarkerDoc) => {
    setSelectedMarkerId(marker.id);
    setSelectedMarker(marker);
    
    // Center and zoom to the selected marker
    if (mapRef.current && marker.lat && marker.lng) {
      mapRef.current.flyTo([marker.lat, marker.lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  }, []);

  const handleMarkerCardClose = useCallback(() => {
    setSelectedMarker(null);
    setSelectedMarkerId(undefined);
  }, []);

  const handleDirections = useCallback((lat: number, lng: number, title: string) => {
    setShowDirectionsModal(true);
  }, []);

  const handleDirectionsModalClose = useCallback(() => {
    setShowDirectionsModal(false);
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const handleCategoryFilterChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading shared map...</p>
        </div>
      </div>
    );
  }

  // Access error state
  if (accessError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Access Map</h3>
          <p className="text-sm text-gray-500 mb-4">{accessError}</p>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Main shared map view
  if (!accessGranted) {
    return null; // Will show password modal if needed
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">{mapTitle}</h1>
          
          {/* Search */}
          <MarkerSearch
            markers={markers}
            onMarkerSelect={handleMarkerSelect}
            className="mb-3"
          />

          {/* Category Filter */}
          <div className="flex items-center justify-between mb-3">
          <CategoryFilter
            availableCategories={availableCategories}
            hasUncategorizedMarkers={hasUncategorizedMarkers}
            selectedCategories={selectedCategories}
            onCategoriesChange={handleCategoryFilterChange}
          />            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('expanded')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'expanded'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Expanded view"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Compact view"
              >
                <Bars3Icon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Marker List */}
        <div className="flex-1 overflow-hidden">
          <MarkerList
            markers={filteredMarkers}
            onMarkerEdit={() => {}} // No-op for read-only mode
            onMarkerDelete={() => {}} // No-op for read-only mode
            onMarkerSelect={handleMarkerSelect}
            selectedMarkerId={selectedMarkerId}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* Right Panel - Full Screen Map */}
      <div className="flex-1 relative">
        <MapCanvas
          onMapClick={() => {}} // No-op for read-only mode
          onMarkerSelect={handleMarkerSelect}
          onMapReady={handleMapReady}
          className="h-full"
          markers={markers}
          selectedMarkerId={selectedMarkerId}
        />
        
        {/* Marker Card Overlay */}
        {selectedMarker && (
          <div className="absolute top-4 right-4 w-80 z-[1000]">
            <MarkerCard
              marker={selectedMarker}
              onClose={handleMarkerCardClose}
              onDirections={handleDirections}
            />
          </div>
        )}

        {/* Map Title Overlay */}
        <div className="absolute top-4 left-4 z-[1000]">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">{mapTitle}</h2>
            <p className="text-sm text-gray-600">Shared Map • Read Only</p>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        mapTitle={mapTitle}
        error={passwordError}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        isLoading={isLoading}
      />

      {/* Directions Modal */}
      {selectedMarker && (
        <DirectionsModal
          isOpen={showDirectionsModal}
          onClose={handleDirectionsModalClose}
          lat={selectedMarker.lat}
          lng={selectedMarker.lng}
          title={selectedMarker.title}
        />
      )}
    </div>
  );
}
