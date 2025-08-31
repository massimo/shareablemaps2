'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

interface MapCanvasProps {
  center?: [number, number];
  zoom?: number;
  onMapReady?: (map: L.Map) => void;
  onMapClick?: (e: L.LeafletMouseEvent) => void;
  className?: string;
}

function MapEventHandler({ onMapClick, onMapReady }: { onMapClick?: (e: L.LeafletMouseEvent) => void; onMapReady?: (map: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }

    if (onMapClick) {
      map.on('click', onMapClick);
    }

    return () => {
      if (onMapClick) {
        map.off('click', onMapClick);
      }
    };
  }, [map, onMapClick, onMapReady]);

  return null;
}

export default function MapCanvas({
  center = [51.505, -0.09], // Default to London
  zoom = 13,
  onMapReady,
  onMapClick,
  className = 'h-full w-full',
}: MapCanvasProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
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
        <MapEventHandler onMapClick={onMapClick} onMapReady={onMapReady} />
      </MapContainer>
    </div>
  );
}
