import { create } from 'zustand';
import { MarkerDoc, MapDoc } from '@/types';
import type { LatLngExpression } from 'leaflet';

interface EditorState {
  currentMap: MapDoc | null;
  markers: MarkerDoc[];
  selectedMarkerId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Map state
  mapCenter: LatLngExpression;
  mapZoom: number;
  mapTitle: string;
  
  // Actions
  setCurrentMap: (map: MapDoc | null) => void;
  setMarkers: (markers: MarkerDoc[]) => void;
  addMarker: (marker: MarkerDoc) => void;
  updateMarker: (markerId: string, updates: Partial<MarkerDoc>) => void;
  removeMarker: (markerId: string) => void;
  setSelectedMarkerId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Map actions
  setMapCenter: (center: LatLngExpression) => void;
  setMapZoom: (zoom: number) => void;
  setMapTitle: (title: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentMap: null,
  markers: [],
  selectedMarkerId: null,
  isLoading: false,
  error: null,
  
  // Initial map state - default to London
  mapCenter: [51.505, -0.09] as LatLngExpression,
  mapZoom: 16,
  mapTitle: 'Untitled Map',

  setCurrentMap: (map) => set({ currentMap: map }),
  
  setMarkers: (markers) => set({ markers }),
  
  addMarker: (marker) => set((state) => ({
    markers: [...state.markers, marker],
  })),
  
  updateMarker: (markerId, updates) => set((state) => ({
    markers: state.markers.map(marker =>
      marker.id === markerId ? { ...marker, ...updates } : marker
    ),
  })),
  
  removeMarker: (markerId) => set((state) => ({
    markers: state.markers.filter(marker => marker.id !== markerId),
    selectedMarkerId: state.selectedMarkerId === markerId ? null : state.selectedMarkerId,
  })),
  
  setSelectedMarkerId: (id) => set({ selectedMarkerId: id }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  // Map actions
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setMapTitle: (title) => set({ mapTitle: title }),
}));

// Alias for backwards compatibility and convenience
export const useMapStore = useEditorStore;
