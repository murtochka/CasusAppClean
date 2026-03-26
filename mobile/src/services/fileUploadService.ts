import { apiClient } from './api';
import { CompressedImageInfo, getMultipleImageInfo, validateImageForUpload, formatFileSize } from '../utils/imageCompression';
import { logger } from '../utils/logger';

export interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  size: number;
  format: string;
}

export interface UploadProgressCallback {
  (progress: number): void;
}

class FileUploadService {
  private uploadDir = 'casus-app/reviews';

  /**
   * Upload a single image file to Cloudinary
   * @param imageUri - Local file URI
   * @param onProgress - Callback for upload progress (0-100)
   * @returns Upload response with public URL
   */
  async uploadImage(
    imageUri: string,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    try {
      // Get image info
      const imageInfos = await getMultipleImageInfo([imageUri]);
      if (imageInfos.length === 0) {
        throw new Error('Failed to process image');
      }

      const imageInfo = imageInfos[0];

      // Validate image
      const validation = validateImageForUpload(imageInfo);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image');
      }

      logger.info('Starting image upload', {
        filename: imageInfo.filename,
        size: formatFileSize(imageInfo.size),
      });

      // Create FormData
      const formData = new FormData();
      const file = {
        uri: imageInfo.uri,
        type: imageInfo.mimeType,
        name: imageInfo.filename,
      } as any;

      formData.append('file', file);
      formData.append('uploadDir', this.uploadDir);
      formData.append('public_id', `${this.uploadDir}/${Date.now()}_${imageInfo.filename}`);

      // Upload using axios with progress tracking
      const response = await apiClient.post<UploadResponse>(
        '/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress?.(percentCompleted);
            }
          },
        }
      );

      logger.info('Image uploaded successfully', {
        url: response.url,
        publicId: response.publicId,
      });

      return response;
    } catch (error) {
      logger.error('Image upload failed', error);
      throw error;
    }
  }

  /**
   * Upload multiple images in parallel
   * @param imageUris - Array of local file URIs
   * @param onProgress - Callback with map of URI -> progress
   * @returns Array of upload responses
   */
  async uploadMultipleImages(
    imageUris: string[],
    onProgress?: (progress: Record<string, number>) => void
  ): Promise<UploadResponse[]> {
    const progressMap: Record<string, number> = {};
    imageUris.forEach(uri => {
      progressMap[uri] = 0;
    });

    try {
      // Validate all images first
      const imageInfos = await getMultipleImageInfo(imageUris);
      for (const imageInfo of imageInfos) {
        const validation = validateImageForUpload(imageInfo);
        if (!validation.valid) {
          throw new Error(`Invalid image ${imageInfo.filename}: ${validation.error}`);
        }
      }

      // Upload in parallel with progress tracking
      const uploadPromises = imageUris.map(uri =>
        this.uploadImage(uri, (progress) => {
          progressMap[uri] = progress;
          onProgress?.(progressMap);
        })
      );

      const results = await Promise.all(uploadPromises);

      logger.info('All images uploaded successfully', {
        count: results.length,
      });

      return results;
    } catch (error) {
      logger.error('Batch upload failed', error);
      throw error;
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await apiClient.delete(`/files/${publicId}`);

      logger.info('Image deleted successfully', { publicId });
    } catch (error) {
      logger.error('Image deletion failed', error);
      throw error;
    }
  }

  /**
   * Extract Cloudinary public ID from URL
   */
  extractPublicIdFromUrl(url: string): string {
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}
    const match = url.match(/\/([^/]+\/[^/]+)(?:\.|$)/);
    return match ? match[1] : '';
  }
}

export const fileUploadService = new FileUploadService();
