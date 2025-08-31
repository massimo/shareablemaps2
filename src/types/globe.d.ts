declare module 'globe.gl' {
  export interface GlobeControls {
    autoRotate: boolean;
    autoRotateSpeed: number;
  }

  export interface GlobeRenderer {
    setSize(width: number, height: number): void;
  }

  export default class Globe {
    constructor(element: HTMLElement, config?: any);
    
    // Globe styling
    globeImageUrl(url?: string): Globe;
    backgroundImageUrl(url?: string): Globe;
    bumpImageUrl(url?: string): Globe;
    
    // Points layer
    pointsData(data: any[]): Globe;
    pointLat(accessor: (d: any) => number): Globe;
    pointLng(accessor: (d: any) => number): Globe;
    pointAltitude(value: number | ((d: any) => number)): Globe;
    pointRadius(value: number | ((d: any) => number)): Globe;
    pointColor(value: string | ((d: any) => string)): Globe;
    pointLabel(accessor: (d: any) => string): Globe;
    pointsMerge(merge: boolean): Globe;
    pointsTransitionDuration(duration: number): Globe;
    onPointClick(callback: (point: any, event: MouseEvent, coords: { lat: number; lng: number; altitude: number }) => void): Globe;
    onPointHover(callback: (point: any, prevPoint: any) => void): Globe;
    
    // Camera and controls
    pointOfView(coords: { lat?: number; lng?: number; altitude?: number }, duration?: number): Globe;
    controls(): GlobeControls;
    
    // Animation
    pauseAnimation(): void;
    resumeAnimation(): void;
    
    // Scene access
    scene(): any;
    camera(): any;
    renderer(): GlobeRenderer;
  }
}
