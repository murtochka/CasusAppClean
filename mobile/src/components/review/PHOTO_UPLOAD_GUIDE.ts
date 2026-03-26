/**
 * Photo Upload Infrastructure - Implementation Guide
 * 
 * This file documents the photo upload flow for review photos.
 * Currently, the backend and types support up to 3 photo URLs per review.
 * 
 * FUTURE IMPLEMENTATION STEPS:
 * 
 * 1. Install expo-image-picker (if not already installed):
 *    npm install expo-image-picker
 * 
 * 2. Create PhotoPicker component in mobile/src/components/review/PhotoPicker.tsx:
 *    - Use expo-image-picker to select up to 3 images
 *    - Display selected image previews with remove buttons
 *    - Validate image size and type
 * 
 * 3. Integrate with file upload service:
 *    - Use existing FILE_UPLOAD_GUIDE.md for Cloudinary setup
 *    - Upload images to /api/v1/files/upload endpoint
 *    - Get back public URLs for each image
 *    - Pass URLs array to review creation/update
 * 
 * 4. Update ReviewScreen ([bookingId].tsx):
 *    - Import PhotoPicker component
 *    - Add photos state: const [photos, setPhotos] = useState<string[]>([])
 *    - Add PhotoPicker below comment input
 *    - Include photos in createReview/updateReview calls
 * 
 * 5. Display photos in ReviewsList component:
 *    - Add horizontal ScrollView for photo thumbnails
 *    - Allow users to tap and view full-size images
 *    - Use expo-image for optimized image loading
 * 
 * EXAMPLE USAGE:
 * 
 * ```tsx
 * import { PhotoPicker } from '@/components/review/PhotoPicker';
 * 
 * const [photos, setPhotos] = useState<string[]>([]);
 * 
 * <PhotoPicker
 *   photos={photos}
 *   onPhotosChange={setPhotos}
 *   maxPhotos={3}
 * />
 * 
 * // On submit:
 * await reviewService.createReview({
 *   bookingId,
 *   rating,
 *   comment,
 *   photos, // Array of Cloudinary URLs
 * });
 * ```
 * 
 * CLOUDINARY SETUP:
 * - Refer to FILE_UPLOAD_GUIDE.md for complete setup
 * - Upload directory: 'casus-app/reviews'
 * - Image transformations: resize to 800x600, optimize quality
 * - Return secure URLs for storage in database
 * 
 * DATABASE SCHEMA:
 * - reviews.photo_urls column (JSONB array) already exists
 * - Supports up to 3 photo URLs per review
 * - URLs are stored as strings (Cloudinary CDN links)
 */

export const PHOTO_UPLOAD_CONFIG = {
  maxPhotos: 3,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  uploadDirectory: 'casus-app/reviews',
  imageTransformations: {
    width: 800,
    height: 600,
    quality: 'auto:good',
  },
};

/**
 * PhotoPicker Component Interface (for future implementation)
 */
export interface PhotoPickerProps {
  photos: string[]; // Array of image URIs or URLs
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

/**
 * File Upload Service Methods (to be added)
 */
export interface FileUploadService {
  uploadImage(uri: string, directory?: string): Promise<string>; // Returns Cloudinary URL
  deleteImage(publicId: string): Promise<void>;
}
