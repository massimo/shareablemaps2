'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/lib/store';
import { MarkerDoc } from '@/types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapCanvasProps {
  className?: string;
  markers: MarkerDoc[];
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onMarkerSelect?: (marker: MarkerDoc) => void;
  onMapReady?: (map: L.Map) => void;
  pendingPosition?: { lat: number; lng: number; address?: string };
  pendingColor?: string;
  pendingMarkerType?: 'pin' | 'circle';
  selectedMarkerId?: string; // Add selected marker ID for highlighting
  center?: [number, number]; // Override center from store
  zoom?: number; // Override zoom from store
}

function MapController({ 
  onMapClick, 
  onMapReady,
  overrideCenter,
  overrideZoom
}: { 
  onMapClick?: (e: L.LeafletMouseEvent) => void; 
  onMapReady?: (map: L.Map) => void;
  overrideCenter?: [number, number];
  overrideZoom?: number;
}) {
  const map = useMap();
  const { mapCenter, mapZoom } = useMapStore();

  // Use override values if provided, otherwise use store values
  const effectiveCenter = overrideCenter || mapCenter;
  const effectiveZoom = overrideZoom || mapZoom;

  // Handle map ready callback
  useEffect(() => {
    if (onMapReady && map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Handle map click events
  useEffect(() => {
    if (!map || !onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  // Update map view when store values change
  useEffect(() => {
    if (map && effectiveCenter) {
      map.setView(effectiveCenter, effectiveZoom, { animate: true });
    }
  }, [map, effectiveCenter, effectiveZoom]);

  return null;
}

export default function MapCanvas({
  onMapReady,
  onMapClick,
  onMarkerSelect,
  className = 'h-full w-full',
  markers = [],
  pendingPosition,
  pendingColor,
  pendingMarkerType = 'pin',
  selectedMarkerId, // Add selected marker ID
  center, // Override center
  zoom, // Override zoom
}: MapCanvasProps) {
  const mapRef = useRef<L.Map | null>(null);
  const { mapCenter, mapZoom } = useMapStore();

  // Use override values if provided, otherwise use store values
  const effectiveCenter = center || mapCenter;
  const effectiveZoom = zoom || mapZoom;

  // Function to create colored marker icons using SVG data URLs for accurate colors
  const createColoredIcon = React.useCallback((color?: string, markerType: 'pin' | 'circle' = 'pin', isSelected: boolean = false) => {
    if (!color) {
      // Default red marker
      return new L.Icon({
        iconUrl: '/leaflet/marker-icon.png',
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        shadowUrl: '/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    }

    let svgIcon: string;
    let iconSize: [number, number];
    let iconAnchor: [number, number];

    if (markerType === 'circle') {
      // Create simple circle marker with optional highlight ring
      const circleRadius = isSelected ? 10 : 8;
      const strokeWidth = isSelected ? 3 : 2;
      const totalSize = isSelected ? 26 : 20;
      
      svgIcon = `
        <svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">
          ${isSelected ? `<circle cx="${totalSize/2}" cy="${totalSize/2}" r="12" fill="none" stroke="#2563eb" stroke-width="2" opacity="0.6"/>` : ''}
          <circle cx="${totalSize/2}" cy="${totalSize/2}" r="${circleRadius}" fill="${color}" stroke="#fff" stroke-width="${strokeWidth}"/>
        </svg>
      `;
      iconSize = [totalSize, totalSize];
      iconAnchor = [totalSize/2, totalSize/2];
    } else {
      // Create traditional pin marker with optional highlight
      const pinWidth = isSelected ? 30 : 25;
      const pinHeight = isSelected ? 46 : 41;
      
      svgIcon = `
        <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 ${pinWidth} ${pinHeight}" xmlns="http://www.w3.org/2000/svg">
          ${isSelected ? `<path d="M${pinWidth/2} 0C${5.596 * pinWidth/25} 0 0 ${5.596 * pinHeight/41} 0 ${12.5 * pinHeight/41}c0 ${8.125 * pinHeight/41} ${pinWidth/2} ${28.5 * pinHeight/41} ${pinWidth/2} ${28.5 * pinHeight/41}S${pinWidth} ${20.625 * pinHeight/41} ${pinWidth} ${12.5 * pinHeight/41}C${pinWidth} ${5.596 * pinHeight/41} ${19.404 * pinWidth/25} 0 ${pinWidth/2} 0z" fill="none" stroke="#2563eb" stroke-width="3" opacity="0.6"/>` : ''}
          <path d="M${pinWidth/2} 0C${5.596 * pinWidth/25} 0 0 ${5.596 * pinHeight/41} 0 ${12.5 * pinHeight/41}c0 ${8.125 * pinHeight/41} ${pinWidth/2} ${28.5 * pinHeight/41} ${pinWidth/2} ${28.5 * pinHeight/41}S${pinWidth} ${20.625 * pinHeight/41} ${pinWidth} ${12.5 * pinHeight/41}C${pinWidth} ${5.596 * pinHeight/41} ${19.404 * pinWidth/25} 0 ${pinWidth/2} 0z" 
                fill="${color}" 
                stroke="#fff" 
                stroke-width="1"/>
          <circle cx="${pinWidth/2}" cy="${12.5 * pinHeight/41}" r="4" fill="#fff"/>
        </svg>
      `;
      iconSize = [pinWidth, pinHeight];
      iconAnchor = [pinWidth/2, pinHeight];
    }
    
    const svgUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    
    return new L.Icon({
      iconUrl: svgUrl,
      shadowUrl: markerType === 'pin' ? '/leaflet/marker-shadow.png' : undefined,
      iconSize,
      iconAnchor,
      popupAnchor: [1, markerType === 'circle' ? -10 : -34],
      shadowSize: markerType === 'pin' ? [41, 41] : undefined,
    });
  }, []);

  // Add CSS for pending marker animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .pending-marker-icon {
        filter: hue-rotate(200deg) brightness(1.2) !important;
        animation: pulse 2s infinite !important;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className={className} style={{ position: 'relative', zIndex: 1 }}>
      <MapContainer
        center={effectiveCenter}
        zoom={effectiveZoom}
        className="h-full w-full"
        style={{ zIndex: 1 }}
        ref={(mapInstance) => {
          if (mapInstance) {
            mapRef.current = mapInstance;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        
        {/* Existing Markers */}
        {markers.map((marker) => {
          const isSelected = selectedMarkerId === marker.id;
          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createColoredIcon(marker.icon?.color, marker.icon?.markerType, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onMarkerSelect) {
                    onMarkerSelect(marker);
                  }
                }
              }}
            >
              <Popup>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm">{marker.title}</h3>
                  {marker.address && (
                    <p className="text-xs text-gray-600 mt-1">{marker.address}</p>
                  )}
                  {marker.description && (
                    <p className="text-xs text-gray-800 mt-2">{marker.description}</p>
                  )}
                  {marker.icon?.color && (
                    <div className="mt-2 flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300 mr-2"
                        style={{ backgroundColor: marker.icon.color }}
                      />
                      <span className="text-xs text-gray-500">Custom Color</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Pending Marker (when creating/editing) */}
        {pendingPosition && (
          <Marker
            key={`pending-marker-${pendingColor}-${pendingMarkerType}`} // Key includes color and type to force re-render
            position={[pendingPosition.lat, pendingPosition.lng]}
            icon={createColoredIcon(pendingColor, pendingMarkerType)}
          >
            <Popup>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-blue-600">Pending Marker</h3>
                {pendingPosition.address && (
                  <p className="text-xs text-gray-600 mt-1">{pendingPosition.address}</p>
                )}
                <p className="text-xs text-blue-500 mt-1">Use the form to add this marker to your map</p>
                {pendingColor && (
                  <div className="mt-2 flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300 mr-2"
                      style={{ backgroundColor: pendingColor }}
                    />
                    <span className="text-xs text-gray-500">Preview Color</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        
        <MapController 
          onMapClick={onMapClick ? (e) => {
            console.log('MapController click event:', e);
            if (e.latlng) {
              onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
            } else {
              console.error('Invalid click event structure:', e);
            }
          } : undefined} 
          onMapReady={onMapReady}
          overrideCenter={center}
          overrideZoom={zoom}
        />
      </MapContainer>
    </div>
  );
}
