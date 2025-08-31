import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { MapDoc } from '@/types';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
};

export class SharedMapService {
  /**
   * Get a shared map by ID and validate access permissions
   */
  static async getSharedMap(mapId: string, password?: string): Promise<{
    map: MapDoc | null;
    accessGranted: boolean;
    requiresPassword: boolean;
    error?: string;
  }> {
    try {
      if (!isFirebaseConfigured()) {
        console.warn('Firebase not configured. Returning demo data for shared map.');
        
        // Return a demo map for development purposes
        const demoMap: MapDoc = {
          id: mapId,
          ownerId: 'demo-user',
          title: 'Demo Shared Map (Firebase not configured)',
          description: 'This is a demo map shown because Firebase is not configured. Please set up Firebase to enable full functionality.',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isPublicLinkEnabled: true,
          shareSettings: {
            shareType: 'public',
            isEnabled: true
          },
          stats: {
            views: 0,
            comments: 0,
            likes: 0
          },
          categories: []
        };
        
        return {
          map: demoMap,
          accessGranted: true,
          requiresPassword: false
        };
      }
      
      const mapRef = doc(db, 'maps', mapId);
      const mapSnap = await getDoc(mapRef);
      
      if (!mapSnap.exists()) {
        return {
          map: null,
          accessGranted: false,
          requiresPassword: false,
          error: 'Map not found'
        };
      }
      
      const mapData = mapSnap.data() as MapDoc;
      const shareSettings = mapData.shareSettings;
      
      // Check if sharing is enabled
      if (!shareSettings?.isEnabled) {
        return {
          map: null,
          accessGranted: false,
          requiresPassword: false,
          error: 'This map is not publicly shared'
        };
      }
      
      // Handle different share types
      switch (shareSettings.shareType) {
        case 'private':
          return {
            map: null,
            accessGranted: false,
            requiresPassword: false,
            error: 'This map is private'
          };
          
        case 'public':
          return {
            map: mapData,
            accessGranted: true,
            requiresPassword: false
          };
          
        case 'password':
          if (!password) {
            return {
              map: null,
              accessGranted: false,
              requiresPassword: true
            };
          }
          
          // Validate password
          if (shareSettings.password && password === shareSettings.password) {
            return {
              map: mapData,
              accessGranted: true,
              requiresPassword: false
            };
          } else {
            return {
              map: null,
              accessGranted: false,
              requiresPassword: true,
              error: 'Invalid password'
            };
          }
          
        default:
          return {
            map: null,
            accessGranted: false,
            requiresPassword: false,
            error: 'Invalid share configuration'
          };
      }
    } catch (error) {
      console.error('Error fetching shared map:', error);
      return {
        map: null,
        accessGranted: false,
        requiresPassword: false,
        error: 'Failed to load map'
      };
    }
  }

  /**
   * Update map share settings
   */
  static async updateShareSettings(mapId: string, shareSettings: {
    shareType: 'private' | 'public' | 'password';
    password?: string;
    isEnabled: boolean;
  }): Promise<void> {
    try {
      console.log('Updating share settings for map:', mapId, shareSettings);
      
      if (!isFirebaseConfigured()) {
        console.warn('Firebase not configured. Simulating share settings update.');
        console.log('Would update map', mapId, 'with settings:', shareSettings);
        
        // Show user a helpful message
        alert('Firebase not configured yet. Please set up your Firebase project and add the configuration to .env.local (see .env.local.example for instructions)');
        return;
      }
      
      const mapRef = doc(db, 'maps', mapId);
      
      // First check if the document exists
      const docSnap = await getDoc(mapRef);
      if (!docSnap.exists()) {
        throw new Error('Map document not found');
      }
      
      // Clean shareSettings to remove undefined values (Firestore doesn't allow them)
      const cleanedShareSettings: any = {
        shareType: shareSettings.shareType,
        isEnabled: shareSettings.isEnabled
      };
      
      // Only include password if it's defined and not empty
      if (shareSettings.password && shareSettings.password.trim() !== '') {
        cleanedShareSettings.password = shareSettings.password;
      }
      
      // Update the shareSettings field in the map document
      const updateData = {
        shareSettings: cleanedShareSettings,
        // Also update the legacy isPublicLinkEnabled field for compatibility
        isPublicLinkEnabled: shareSettings.isEnabled && shareSettings.shareType !== 'private',
        updatedAt: Timestamp.now()
      };
      
      console.log('Updating with data:', updateData);
      await updateDoc(mapRef, updateData);
      
      console.log('Share settings updated successfully for map:', mapId);
    } catch (error) {
      console.error('Error updating share settings:', error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        throw new Error(`Failed to update share settings: ${error.message}`);
      } else {
        throw new Error('Failed to update share settings: Unknown error');
      }
    }
  }
}
