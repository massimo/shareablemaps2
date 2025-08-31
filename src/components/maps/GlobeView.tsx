'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { MapDoc } from '@/types';

interface GlobeViewProps {
  maps: MapDoc[];
  className?: string;
  globeStyle?: 'night' | 'day' | 'satellite';
}

export default function GlobeView({ maps, className = '', globeStyle = 'night' }: GlobeViewProps) {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter maps that have valid coordinates
  const validMaps = maps.filter(map => 
    map.mainLocation?.lat != null && 
    map.mainLocation?.lng != null
  );

  // Show message if no valid maps
  if (validMaps.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <GlobeAltIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No maps with locations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Maps need to have a main location set to appear on the 3D globe.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let isMounted = true;

    const initGlobe = async () => {
      try {
        // Dynamic import for client-side only
        const Globe = (await import('globe.gl')).default;
        
        if (!isMounted || !globeEl.current) return;

        // Get globe texture based on style
        const getGlobeTexture = () => {
          switch (globeStyle) {
            case 'day':
              return '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg';
            case 'satellite':
              return '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg';
            default:
              return '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg';
          }
        };

        // Create globe instance
        const globe = new Globe(globeEl.current)
          .globeImageUrl(getGlobeTexture())
          .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
          .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
          .pointsData(validMaps)
          .pointLat((d: any) => (d as MapDoc).mainLocation!.lat)
          .pointLng((d: any) => (d as MapDoc).mainLocation!.lng)
          .pointAltitude(0.02)
          .pointRadius(0.15)
          .pointColor(() => '#3b82f6') // Blue color
          .pointLabel((d: any) => {
            const map = d as MapDoc;
            const title = map.title || 'Untitled Map';
            const location = map.mainLocation?.city || map.mainLocation?.address || 'Unknown location';
            const description = map.description || '';
            
            return `
              <div style="background: rgba(0,0,0,0.8); padding: 12px; border-radius: 8px; color: white; max-width: 250px;">
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${title}</div>
                ${description ? `<div style="font-size: 12px; margin-bottom: 8px; opacity: 0.9;">${description}</div>` : ''}
                <div style="font-size: 11px; opacity: 0.7;">
                  📍 ${location}
                </div>
                <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; opacity: 0.8;">
                  <span>👁 ${map.stats?.views || 0}</span>
                  <span>❤️ ${map.stats?.likes || 0}</span>
                  <span>💬 ${map.stats?.comments || 0}</span>
                </div>
                <div style="margin-top: 8px; font-size: 10px; opacity: 0.6;">
                  Click to open map
                </div>
              </div>
            `;
          })
          .onPointClick((point: any) => {
            const map = point as MapDoc;
            if (map.id) {
              router.push(`/maps/${map.id}`);
            }
          })
          .onPointHover((point: any, prevPoint: any) => {
            // Change cursor on hover
            if (globeEl.current) {
              globeEl.current.style.cursor = point ? 'pointer' : 'grab';
            }
          })
          .pointsMerge(false) // Keep separate for click events
          .pointsTransitionDuration(1000);

        // Set initial camera position
        globe.pointOfView({ lat: 30, lng: 0, altitude: 2.5 }, 1000);

        // Enable auto-rotation
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.5;

        // Handle window resize
        const handleResize = () => {
          if (globeEl.current && globe) {
            try {
              // Force re-render on resize
              globe.renderer().setSize(
                globeEl.current.clientWidth, 
                globeEl.current.clientHeight
              );
            } catch (err) {
              console.warn('Globe resize error:', err);
            }
          }
        };

        window.addEventListener('resize', handleResize);
        globeRef.current = globe;
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to initialize globe:', err);
        if (isMounted) {
          setError('Failed to load 3D globe visualization');
          setIsLoading(false);
        }
      }
    };

    initGlobe();

    return () => {
      isMounted = false;
      window.removeEventListener('resize', () => {});
      
      // Cleanup globe instance
      if (globeRef.current) {
        try {
          globeRef.current.pauseAnimation();
        } catch (err) {
          console.warn('Globe cleanup error:', err);
        }
        globeRef.current = null;
      }
    };
  }, [maps, router, validMaps]);

  // Update globe data when maps change
  useEffect(() => {
    if (globeRef.current && !isLoading) {
      const currentValidMaps = maps.filter((map: MapDoc) => 
        map.mainLocation?.lat != null && 
        map.mainLocation?.lng != null
      );
      globeRef.current.pointsData(currentValidMaps);
    }
  }, [maps, isLoading]);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Failed to load 3D globe</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading 3D Globe...</p>
          </div>
        </div>
      )}
      <div 
        ref={globeEl} 
        className="w-full rounded-lg overflow-hidden bg-gray-900"
        style={{ 
          height: '500px',
          minHeight: '400px'
        }}
      />
      {!isLoading && validMaps.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded">
          {validMaps.length} maps plotted
        </div>
      )}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>📍 Click markers to open maps</div>
        </div>
      )}
    </div>
  );
}
