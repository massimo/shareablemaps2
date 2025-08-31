'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  PhotoIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import imageCompression from 'browser-image-compression';
import { ImageStorageService } from '@/lib/imageStorageService';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  compressed?: File;
  uploading: boolean;
  error?: string;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  disabled = false 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs when component unmounts or imageFiles change
  useEffect(() => {
    return () => {
      imageFiles.forEach(imageFile => {
        URL.revokeObjectURL(imageFile.preview);
      });
    };
  }, [imageFiles]);

  const compressImage = async (file: File): Promise<File> => {
    try {
      console.log(`Compressing ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Two-stage compression for better results
      // Stage 1: Initial compression to reasonable size
      const firstStage = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.8
      });

      // Stage 2: Aggressive compression for database storage
      const finalCompressed = await imageCompression(firstStage, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.4,
        fileType: 'image/jpeg'
      });

      const compressionRatio = ((file.size - finalCompressed.size) / file.size * 100).toFixed(1);
      console.log(`${file.name} compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(finalCompressed.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`);

      return finalCompressed;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    
    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    for (const file of fileArray) {
      const validation = ImageStorageService.validateImage(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }
    
    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }
    
    if (validFiles.length === 0) {
      return;
    }

    const currentImageCount = images.length + validFiles.length;
    if (currentImageCount > maxImages) {
      alert(`You can only upload up to ${maxImages} images. You're trying to add ${validFiles.length} images, but you already have ${images.length}.`);
      return;
    }

    setIsCompressing(true);

    try {
      const newImageFiles: ImageFile[] = [];

      for (const file of validFiles) {
        const id = Date.now() + Math.random().toString(36);
        const preview = URL.createObjectURL(file);
        
        const imageFile: ImageFile = {
          id,
          file,
          preview,
          uploading: false,
          error: undefined,
        };

        newImageFiles.push(imageFile);
      }

      // Add to state immediately for preview
      setImageFiles(prev => [...prev, ...newImageFiles]);

      // Compress images in background
      const processedImages: string[] = [];
      const successfulImageIds: string[] = [];
      
      for (let i = 0; i < newImageFiles.length; i++) {
        const imageFile = newImageFiles[i];
        
        try {
          // Update uploading state
          setImageFiles(prev => 
            prev.map(img => 
              img.id === imageFile.id 
                ? { ...img, uploading: true, error: undefined }
                : img
            )
          );

          // Compress the image
          const compressedFile = await compressImage(imageFile.file);
          
          // Convert to base64
          const base64String = await convertToBase64(compressedFile);
          processedImages.push(base64String);
          successfulImageIds.push(imageFile.id);

          // Update success state temporarily
          setImageFiles(prev => 
            prev.map(img => 
              img.id === imageFile.id 
                ? { ...img, uploading: false, compressed: compressedFile }
                : img
            )
          );

        } catch (error) {
          console.error('Error processing image:', error);
          
          // Update error state
          setImageFiles(prev => 
            prev.map(img => 
              img.id === imageFile.id 
                ? { ...img, uploading: false, error: 'Failed to process image' }
                : img
            )
          );
        }
      }

      // Update parent with new images
      if (processedImages.length > 0) {
        onImagesChange([...images, ...processedImages]);
        
        // Remove successfully processed image files to prevent duplication
        setImageFiles(prev => {
          const remaining = prev.filter(img => !successfulImageIds.includes(img.id));
          // Clean up object URLs for removed images
          prev.filter(img => successfulImageIds.includes(img.id)).forEach(img => {
            URL.revokeObjectURL(img.preview);
          });
          return remaining;
        });
      }

    } finally {
      setIsCompressing(false);
    }
  }, [images, onImagesChange, maxImages, disabled, compressImage]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const removeImageFile = useCallback((id: string) => {
    setImageFiles(prev => {
      const fileToRemove = prev.find(img => img.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          <PhotoIcon className={`mx-auto h-12 w-12 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
          <div>
            <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
              {dragActive ? 'Drop images here' : 'Drag & drop images here, or click to browse'}
            </p>
            <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
              PNG, JPG, WebP up to 20MB each (max {maxImages} images)
            </p>
          </div>
        </div>

        {(isCompressing || imageFiles.some(img => img.uploading)) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-blue-600">
              <ArrowUpTrayIcon className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Processing images...</span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Images Grid */}
      {(images.length > 0 || imageFiles.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Images ({images.length + imageFiles.filter(img => !img.error).length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Saved images */}
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!disabled && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Processing images */}
            {imageFiles.map((imageFile) => (
              <div key={imageFile.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imageFile.preview}
                    alt="Processing"
                    className={`w-full h-full object-cover ${
                      imageFile.uploading ? 'opacity-50' : ''
                    }`}
                  />
                  
                  {/* Loading overlay */}
                  {imageFile.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <ArrowUpTrayIcon className="h-6 w-6 text-white animate-pulse" />
                    </div>
                  )}

                  {/* Error overlay */}
                  {imageFile.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-40 flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeImageFile(imageFile.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>

                {/* Error message */}
                {imageFile.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 rounded-b-lg">
                    {imageFile.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
