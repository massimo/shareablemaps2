// Simple image storage service
// In production, you would want to use Firebase Storage or another cloud storage service
// This implementation stores base64 images directly in Firestore for demo purposes

export class ImageStorageService {
  /**
   * For this demo, we'll store images as base64 directly in the marker document.
   * In production, you should:
   * 1. Upload images to Firebase Storage or AWS S3
   * 2. Store only the image URLs in Firestore
   * 3. Implement proper image resizing and optimization on the server
   */
  
  static async uploadImages(images: string[]): Promise<string[]> {
    // In this simple implementation, we just return the base64 strings
    // They will be stored directly in the Firestore document
    return images;
  }

  static async deleteImages(imageUrls: string[]): Promise<void> {
    // In this simple implementation, we don't need to delete anything
    // since images are stored as base64 in the document
    // In production, you would delete files from cloud storage here
    console.log('Images would be deleted from cloud storage:', imageUrls.length);
  }

  /**
   * Generate a thumbnail from base64 image
   */
  static generateThumbnail(base64Image: string, maxWidth: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnailBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = base64Image;
    });
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be smaller than 10MB' };
    }

    // Check file name
    if (file.name.length > 100) {
      return { valid: false, error: 'File name too long' };
    }

    return { valid: true };
  }
}

// Production implementation would look like this:
/*
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export class ImageStorageService {
  static async uploadImages(imageFiles: File[], markerId: string): Promise<string[]> {
    const uploadPromises = imageFiles.map(async (file, index) => {
      const fileName = `markers/${markerId}/${Date.now()}_${index}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    });

    return Promise.all(uploadPromises);
  }

  static async deleteImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(async (url) => {
      try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
      } catch (error) {
        console.warn('Failed to delete image:', url, error);
      }
    });

    await Promise.all(deletePromises);
  }
}
*/
