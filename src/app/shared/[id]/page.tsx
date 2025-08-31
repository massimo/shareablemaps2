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
import { Bars3Icon, Squares2X2Icon, KeyIcon } from '@heroicons/react/24/outline';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  // Access control states
  const [isLoading, setIsLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [accessError, setAccessError] = useState<string>();

  const mapRef = useRef<L.Map | null>(null);

  // Handle window resize to auto-close sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

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
        console.log('Loading shared map with ID:', id);
        const result = await SharedMapService.getSharedMap(id);
        console.log('SharedMapService result:', result);
        
        if (!result.accessGranted) {
          if (result.requiresPassword) {
            console.log('Map requires password, showing password modal');
            setRequiresPassword(true);
            setShowPasswordModal(true);
            setMapTitle(result.map?.title || 'Protected Map');
          } else {
            console.log('Access denied:', result.error);
            setAccessError(result.error || 'Access denied');
          }
          setIsLoading(false);
          return;
        }

        if (result.map) {
          setMapTitle(result.map.title);
          setAccessGranted(true);
          
          // Load markers first to determine map center
          const markersData = await MarkerService.getMarkersByMapId(id);
          setMarkers(markersData);
          
          // Set map center and zoom based on available data
          if (result.map.mainLocation) {
            // Use the map's main location if available
            console.log('Using main location:', result.map.mainLocation);
            setMapCenter([result.map.mainLocation.lat, result.map.mainLocation.lng]);
            setMapZoom(16);
          } else if (markersData.length > 0) {
            // Calculate center from markers if no main location
            console.log('Calculating center from markers:', markersData.length, 'markers');
            if (markersData.length === 1) {
              // Single marker - center on it
              console.log('Single marker center:', markersData[0].lat, markersData[0].lng);
              setMapCenter([markersData[0].lat, markersData[0].lng]);
              setMapZoom(16);
            } else {
              // Multiple markers - calculate bounding box center
              const lats = markersData.map(m => m.lat);
              const lngs = markersData.map(m => m.lng);
              const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
              const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
              console.log('Multiple markers center:', centerLat, centerLng);
              setMapCenter([centerLat, centerLng]);
              
              // Adjust zoom based on marker spread
              const latRange = Math.max(...lats) - Math.min(...lats);
              const lngRange = Math.max(...lngs) - Math.min(...lngs);
              const maxRange = Math.max(latRange, lngRange);
              
              if (maxRange < 0.01) setMapZoom(16);      // Very close markers
              else if (maxRange < 0.1) setMapZoom(13);   // City level
              else if (maxRange < 1) setMapZoom(10);     // Region level
              else setMapZoom(8);                        // Country level
              
              console.log('Calculated zoom:', maxRange < 0.01 ? 16 : maxRange < 0.1 ? 13 : maxRange < 1 ? 10 : 8);
            }
          } else {
            console.log('No main location or markers, using default center');
          }
          // If no mainLocation and no markers, keep default center

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
    
    // Close sidebar on mobile when marker is selected
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
    
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

  // Password-protected map view
  if (!accessGranted && requiresPassword) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-blue-600 mb-4">
            <KeyIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Password Required</h3>
          <p className="text-sm text-gray-500 mb-4">This map is password protected. Please enter the password to view it.</p>
          
          {/* Password Modal will be rendered at the bottom */}
          <PasswordModal
            isOpen={showPasswordModal}
            mapTitle={mapTitle}
            error={passwordError}
            onSubmit={handlePasswordSubmit}
            onCancel={handlePasswordCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  // Main shared map view
  if (!accessGranted) {
    return null; // This should not happen if logic above handles password case
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 relative">
      {/* Mobile Burger Menu Button - Hidden by default, only show on mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden max-sm:block fixed top-4 left-4 z-[2000] bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
        style={{ 
          display: isSidebarOpen ? 'none' : undefined // Only hide when sidebar is open, let CSS classes handle responsive behavior
        }}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[1500]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex h-full">
        {/* Left Panel - Collapsible on Mobile */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative top-0 left-0 h-full w-80 bg-white border-r border-gray-200 flex flex-col z-[1600] lg:z-auto
          transition-transform duration-300 ease-in-out
        `}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 space-y-4">
            {/* Close button for mobile */}
            <div className="lg:hidden flex justify-between items-center">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{mapTitle}</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{mapTitle}</h1>
            </div>

            {/* Search */}
            <MarkerSearch
              markers={markers}
              onMarkerSelect={handleMarkerSelect}
              className="mb-3"
            />

            {/* Category Filter & View Toggle */}
            <div className="flex items-center justify-between">
              <CategoryFilter
                availableCategories={availableCategories}
                hasUncategorizedMarkers={hasUncategorizedMarkers}
                selectedCategories={selectedCategories}
                onCategoriesChange={handleCategoryFilterChange}
              />
              
              {/* View Toggle */}
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
            center={mapCenter}
            zoom={mapZoom}
          />
          
          {/* Marker Card Overlay - Responsive */}
          {selectedMarker && (
            <div className="absolute inset-x-4 top-4 sm:top-4 sm:right-4 sm:left-auto sm:w-80 sm:max-w-[calc(100vw-2rem)] z-[1000]">
              <MarkerCard
                marker={selectedMarker}
                onClose={handleMarkerCardClose}
                onDirections={handleDirections}
              />
            </div>
          )}

          {/* Map Title Overlay - Mobile only, hidden on desktop */}
          <div className={`absolute z-[1000] lg:hidden ${isSidebarOpen ? 'hidden' : 'block'} top-5 left-1/2 transform -translate-x-1/2`}>
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 text-center">{mapTitle}</h2>
              <p className="text-sm text-gray-600 text-center">Shared Map • Read Only</p>
            </div>
          </div>
        </div>
      </div>

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
