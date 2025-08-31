import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { MarkerDoc } from '@/types';

export class MarkerService {
  private static readonly COLLECTION = 'markers';

  /**
   * Create a new marker for a map
   */
  static async createMarker(mapId: string, markerData: Omit<MarkerDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarkerDoc> {
    try {
      console.log('MarkerService.createMarker - Creating marker for mapId:', mapId);
      console.log('MarkerService.createMarker - Marker data:', markerData);

      const markerToCreate = {
        ...markerData,
        mapId, // Link marker to the map
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('MarkerService.createMarker - Data to save:', markerToCreate);

      const docRef = await addDoc(collection(db, this.COLLECTION), markerToCreate);
      console.log('MarkerService.createMarker - Document created with ID:', docRef.id);
      
      return {
        ...markerData,
        id: docRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
    } catch (error) {
      console.error('MarkerService.createMarker - Error creating marker:', error);
      console.error('MarkerService.createMarker - Error details:', {
        code: (error as any).code,
        message: (error as any).message,
        mapId,
        markerData
      });
      throw new Error(`Failed to create marker: ${(error as any).message}`);
    }
  }

  /**
   * Update an existing marker
   */
  static async updateMarker(markerId: string, updates: Partial<Omit<MarkerDoc, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const markerRef = doc(db, this.COLLECTION, markerId);
      await updateDoc(markerRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating marker:', error);
      throw new Error('Failed to update marker');
    }
  }

  /**
   * Delete a marker
   */
  static async deleteMarker(markerId: string): Promise<void> {
    try {
      const markerRef = doc(db, this.COLLECTION, markerId);
      await deleteDoc(markerRef);
    } catch (error) {
      console.error('Error deleting marker:', error);
      throw new Error('Failed to delete marker');
    }
  }

  /**
   * Get all markers for a specific map
   */
  static async getMarkersByMapId(mapId: string): Promise<MarkerDoc[]> {
    try {
      console.log('MarkerService.getMarkersByMapId - Fetching markers for map:', mapId);
      
      // Simple query without orderBy to avoid requiring an index
      const markersQuery = query(
        collection(db, this.COLLECTION),
        where('mapId', '==', mapId)
      );

      const querySnapshot = await getDocs(markersQuery);
      const markers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarkerDoc));

      // Sort client-side by createdAt if timestamps exist
      markers.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      console.log('MarkerService.getMarkersByMapId - Found', markers.length, 'markers');
      return markers;
    } catch (error) {
      console.error('MarkerService.getMarkersByMapId - Error fetching markers:', error);
      console.error('MarkerService.getMarkersByMapId - Error details:', {
        code: (error as any).code,
        message: (error as any).message,
        mapId
      });
      throw new Error(`Failed to fetch markers: ${(error as any).message}`);
    }
  }

  /**
   * Get markers by category
   */
  static async getMarkersByCategory(mapId: string, categoryId: string): Promise<MarkerDoc[]> {
    try {
      console.log('MarkerService.getMarkersByCategory - Fetching markers for map:', mapId, 'category:', categoryId);
      
      // Simple query without orderBy to avoid requiring an index
      const markersQuery = query(
        collection(db, this.COLLECTION),
        where('mapId', '==', mapId),
        where('categoryId', '==', categoryId)
      );

      const querySnapshot = await getDocs(markersQuery);
      const markers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarkerDoc));

      // Sort client-side by createdAt if timestamps exist
      markers.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      console.log('MarkerService.getMarkersByCategory - Found', markers.length, 'markers in category');
      return markers;
    } catch (error) {
      console.error('MarkerService.getMarkersByCategory - Error fetching markers by category:', error);
      throw new Error(`Failed to fetch markers by category: ${(error as any).message}`);
    }
  }
}
