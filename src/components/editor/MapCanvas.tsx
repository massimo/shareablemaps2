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
  onMapReady?: (map: L.Map) => void;
  onMapClick?: (e: L.LeafletMouseEvent) => void;
  className?: string;
  markers?: MarkerDoc[];
  pendingPosition?: { lat: number; lng: number; address?: string };
  pendingColor?: string;
}

function MapController({ 
  onMapClick, 
  onMapReady 
}: { 
  onMapClick?: (e: L.LeafletMouseEvent) => void; 
  onMapReady?: (map: L.Map) => void;
}) {
  const map = useMap();
  const { mapCenter, mapZoom } = useMapStore();

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
    if (map && mapCenter) {
      map.setView(mapCenter, mapZoom, { animate: true });
    }
  }, [map, mapCenter, mapZoom]);

  return null;
}

export default function MapCanvas({
  onMapReady,
  onMapClick,
  className = 'h-full w-full',
  markers = [],
  pendingPosition,
  pendingColor,
}: MapCanvasProps) {
  const mapRef = useRef<L.Map | null>(null);
  const { mapCenter, mapZoom } = useMapStore();

  // Function to create colored marker icons
  const createColoredIcon = React.useCallback((color?: string) => {
    const baseIconUrl = '/leaflet/marker-icon.png';
    
    return new L.Icon({
      iconUrl: baseIconUrl,
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      shadowUrl: '/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: color ? `colored-marker-${color.replace('#', '')}` : undefined,
    });
  }, []);

  // Create a special icon for pending markers using useMemo to prevent recreation
  const pendingIcon = React.useMemo(() => {
    return new L.Icon({
      iconUrl: '/leaflet/marker-icon.png',
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      shadowUrl: '/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'pending-marker-icon',
    });
  }, []);

  // Add CSS for pending marker animation and colored markers
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
      
      /* Colored marker styles */
      .colored-marker-ef4444 { filter: hue-rotate(0deg) brightness(1) saturate(1.5); }
      .colored-marker-3b82f6 { filter: hue-rotate(220deg) brightness(1.1) saturate(1.3); }
      .colored-marker-10b981 { filter: hue-rotate(140deg) brightness(1.1) saturate(1.4); }
      .colored-marker-f59e0b { filter: hue-rotate(35deg) brightness(1.2) saturate(1.5); }
      .colored-marker-8b5cf6 { filter: hue-rotate(260deg) brightness(1.1) saturate(1.3); }
      .colored-marker-ec4899 { filter: hue-rotate(320deg) brightness(1.2) saturate(1.4); }
      .colored-marker-f97316 { filter: hue-rotate(25deg) brightness(1.1) saturate(1.5); }
      .colored-marker-14b8a6 { filter: hue-rotate(175deg) brightness(1.1) saturate(1.4); }
      .colored-marker-6366f1 { filter: hue-rotate(235deg) brightness(1.1) saturate(1.3); }
      .colored-marker-6b7280 { filter: grayscale(1) brightness(0.8); }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
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
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createColoredIcon(marker.icon?.color)}
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
        ))}
        
        {/* Pending Marker (when creating/editing) */}
        {pendingPosition && (
          <Marker
            key={`pending-marker-${pendingColor}`} // Key includes color to force re-render
            position={[pendingPosition.lat, pendingPosition.lng]}
            icon={createColoredIcon(pendingColor)}
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
        
        <MapController onMapClick={onMapClick} onMapReady={onMapReady} />
      </MapContainer>
    </div>
  );
}
