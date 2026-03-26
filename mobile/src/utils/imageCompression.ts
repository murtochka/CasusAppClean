import * as FileSystem from 'expo-file-system';

export interface CompressedImageInfo {
  uri: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Image compression utility for review photos
 * 
 * Strategy: 
 * 1. ImagePicker handles quality during selection (quality: 0.8)
 * 2. This utility validates and prepares images for upload
 * 3. Estimates final size based on dimensions and quality
 * 
 * Note: Full image manipulation (resize) requires additional libraries
 * Current implementation focuses on metadata validation and size estimation
 */

/**
 * Get image file info and estimate compressed size
 * @param uri - Local file URI
 * @returns Image info with estimated compressed size
 */
export async function getImageInfo(uri: string): Promise<CompressedImageInfo> {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      throw new Error('Image file does not exist');
    }

    // Extract filename and MIME type from URI
    const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };

    const mimeType = mimeTypeMap[extension] || 'image/jpeg';
    const originalSize = fileInfo.size || 0;

    // Estimate compressed size (assuming quality: 0.8 reduces size by ~40%)
    const estimatedSize = Math.round(originalSize * 0.6);

    return {
      uri,
      filename,
      mimeType,
      size: Math.min(estimatedSize, originalSize), // Use original if smaller
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
}

/**
 * Batch get info for multiple images
 */
export async function getMultipleImageInfo(
  uris: string[]
): Promise<CompressedImageInfo[]> {
  const results = await Promise.all(
    uris.map(uri => getImageInfo(uri).catch(err => {
      console.error(`Failed to process image: ${uri}`, err);
      return null;
    }))
  );
  return results.filter((info): info is CompressedImageInfo => info !== null);
}

/**
 * Validate if image is suitable for upload
 */
export function validateImageForUpload(
  imageInfo: CompressedImageInfo,
  maxSizeBytes = 5 * 1024 * 1024
): { valid: boolean; error?: string } {
  // Check file size
  if (imageInfo.size > maxSizeBytes) {
    const sizeMB = (imageInfo.size / (1024 * 1024)).toFixed(2);
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image is ${sizeMB}MB, maximum is ${maxMB}MB`,
    };
  }

  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(imageInfo.mimeType)) {
    return {
      valid: false,
      error: `Format ${imageInfo.mimeType} not supported. Use JPEG, PNG, or WebP.`,
    };
  }

  return { valid: true };
}

/**
 * Prepare images for upload to Cloudinary
 * Creates FormData with proper MIME types and filenames
 */
export function prepareImagesForUpload(
  imageInfos: CompressedImageInfo[]
): FormData {
  const formData = new FormData();

  imageInfos.forEach((imageInfo, index) => {
    // Create file object compatible with fetch
    const file = {
      uri: imageInfo.uri,
      type: imageInfo.mimeType,
      name: imageInfo.filename,
    } as any;

    formData.append(`file[${index}]`, file);
  });

  return formData;
}

/**
 * Calculate total size of images in bytes
 */
export function calculateTotalSize(imageInfos: CompressedImageInfo[]): number {
  return imageInfos.reduce((total, img) => total + img.size, 0);
}

/**
 * Format bytes for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
