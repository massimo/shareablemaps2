import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { MapDoc } from '@/types';

const MAPS_COLLECTION = 'maps';

/**
 * Generate a secure, URL-safe hash for map sharing
 */
function generateMapHash(): string {
  // Use crypto.randomUUID() and take first 12 characters
  // Remove hyphens and make URL-safe
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return uuid.substring(0, 12);
}

/**
 * Create a new map in Firestore
 */
export async function createMap(
  userId: string,
  mapData: {
    title: string;
    description?: string;
    tags?: string[];
    mainLocation?: {
      lat: number;
      lng: number;
      address: string;
      city?: string;
    };
  }
): Promise<{ id: string; shareId: string }> {
  try {
    const shareId = generateMapHash();
    
    const newMap: Omit<MapDoc, 'id'> = {
      ownerId: userId,
      title: mapData.title,
      description: mapData.description,
      mainLocation: mapData.mainLocation,
      tags: mapData.tags || [],
      shareId,
      isPublicLinkEnabled: false,
      stats: {
        views: 0,
        comments: 0,
        likes: 0,
      },
      categories: [],
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, MAPS_COLLECTION), newMap);
    
    return {
      id: docRef.id,
      shareId,
    };
  } catch (error) {
    console.error('Error creating map:', error);
    throw new Error('Failed to create map');
  }
}

/**
 * Get a map by its document ID
 */
export async function getMapById(mapId: string): Promise<MapDoc | null> {
  try {
    const docRef = doc(db, MAPS_COLLECTION, mapId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as MapDoc;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting map:', error);
    throw new Error('Failed to get map');
  }
}

/**
 * Get a map by its share ID (hash)
 */
export async function getMapByShareId(shareId: string): Promise<MapDoc | null> {
  try {
    const q = query(
      collection(db, MAPS_COLLECTION),
      where('shareId', '==', shareId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as MapDoc;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting map by share ID:', error);
    throw new Error('Failed to get map');
  }
}

/**
 * Get all maps for a specific user
 */
export async function getUserMaps(userId: string): Promise<MapDoc[]> {
  try {
    const q = query(
      collection(db, MAPS_COLLECTION),
      where('ownerId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const maps = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MapDoc[];

    // Sort by updatedAt on the client side to avoid needing a Firestore index
    return maps.sort((a, b) => {
      const aTime = a.updatedAt?.seconds || 0;
      const bTime = b.updatedAt?.seconds || 0;
      return bTime - aTime; // Descending order (newest first)
    });
  } catch (error) {
    console.error('Error getting user maps:', error);
    throw new Error('Failed to get user maps');
  }
}

/**
 * Update just the title of a map
 */
export async function updateMapTitle(mapId: string, title: string): Promise<void> {
  try {
    await updateMap(mapId, { title });
  } catch (error) {
    console.error('Error updating map title:', error);
    throw new Error('Failed to update map title');
  }
}

/**
 * Update an existing map
 */
export async function updateMap(
  mapId: string,
  updates: Partial<Omit<MapDoc, 'id' | 'ownerId' | 'createdAt' | 'shareId'>>
): Promise<void> {
  try {
    const docRef = doc(db, MAPS_COLLECTION, mapId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating map:', error);
    throw new Error('Failed to update map');
  }
}

/**
 * Delete a map
 */
export async function deleteMap(mapId: string): Promise<void> {
  try {
    const docRef = doc(db, MAPS_COLLECTION, mapId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting map:', error);
    throw new Error('Failed to delete map');
  }
}

/**
 * Toggle public link sharing for a map
 */
export async function togglePublicSharing(mapId: string, enabled: boolean): Promise<void> {
  try {
    await updateMap(mapId, {
      isPublicLinkEnabled: enabled,
    });
  } catch (error) {
    console.error('Error toggling public sharing:', error);
    throw new Error('Failed to update sharing settings');
  }
}

/**
 * Increment view count for a map
 */
export async function incrementMapViews(mapId: string): Promise<void> {
  try {
    const mapDoc = await getMapById(mapId);
    if (mapDoc) {
      await updateMap(mapId, {
        stats: {
          ...mapDoc.stats,
          views: mapDoc.stats.views + 1,
        },
      });
    }
  } catch (error) {
    console.error('Error incrementing map views:', error);
    // Don't throw error for view counting failures
  }
}
