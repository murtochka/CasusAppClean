import { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  useColorScheme,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants';

export interface PhotoPickerProps {
  photos: string[]; // Array of local URIs or Cloudinary URLs
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  uploading?: boolean;
  uploadProgress?: Record<string, number>; // Map of URI -> progress (0-100)
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PhotoPicker({
  photos,
  onPhotosChange,
  maxPhotos = 3,
  uploading = false,
  uploadProgress = {},
}: PhotoPickerProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { width } = useWindowDimensions();

  const [requestingPermission, setRequestingPermission] = useState(false);

  const handlePickImage = useCallback(async () => {
    try {
      setRequestingPermission(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'We need permission to access your photos to upload them to your review.'
        );
        setRequestingPermission(false);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultiple: true,
        selectionLimit: maxPhotos - photos.length, // Can only select up to remaining slots
      });

      if (!result.canceled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Validate selected images
        const validPhotos: string[] = [];
        for (const asset of result.assets) {
          // Check file size if available
          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert(
              'File Too Large',
              `"${asset.fileName || 'Image'}" exceeds 5MB. Please select a smaller image.`
            );
            continue;
          }

          // Check MIME type if available
          if (
            asset.mimeType &&
            !ALLOWED_TYPES.includes(asset.mimeType)
          ) {
            Alert.alert(
              'Invalid Format',
              `"${asset.fileName || 'Image'}" is not a supported format. Please use JPEG, PNG, or WebP.`
            );
            continue;
          }

          validPhotos.push(asset.uri);
        }

        if (validPhotos.length > 0) {
          onPhotosChange([...photos, ...validPhotos]);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    } finally {
      setRequestingPermission(false);
    }
  }, [photos, onPhotosChange, maxPhotos]);

  const handleRemovePhoto = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    },
    [photos, onPhotosChange]
  );

  const canAddMore = photos.length < maxPhotos && !uploading;

  const photoWidth = (width - Spacing.xl * 2 - Spacing.md * (maxPhotos - 1)) / maxPhotos;
  const photoHeight = photoWidth;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.text }]}>
          Add photos (optional)
        </Text>
        <Text style={[styles.maxText, { color: theme.textTertiary }]}>
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      {/* Photo Grid */}
      <View style={styles.photoGrid}>
        {/* Photo Thumbnails */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.photosScroll}
        >
          {photos.map((photoUri, index) => {
            const progress = uploadProgress[photoUri] || 0;
            const isUploading = uploading && progress < 100 && progress > 0;

            return (
              <View
                key={`${photoUri}-${index}`}
                style={[
                  styles.photoContainer,
                  {
                    width: photoWidth,
                    height: photoHeight,
                    marginRight: index < photos.length - 1 ? Spacing.md : 0,
                  },
                ]}
              >
                {/* Photo Image */}
                <Image
                  source={{ uri: photoUri }}
                  style={[
                    styles.photo,
                    {
                      opacity: isUploading ? 0.6 : 1,
                    },
                  ]}
                />

                {/* Upload Progress Overlay */}
                {isUploading && (
                  <View style={[styles.progressOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                  </View>
                )}

                {/* Remove Button */}
                {!isUploading && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePhoto(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Add Photo Button */}
          {canAddMore && (
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  width: photoWidth,
                  height: photoHeight,
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
              onPress={handlePickImage}
              disabled={requestingPermission}
              activeOpacity={0.7}
            >
              {requestingPermission ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="image-outline"
                    size={32}
                    color={Colors.primary}
                  />
                  <Text style={[styles.addText, { color: Colors.primary }]}>
                    Add
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Info Text */}
      <Text style={[styles.helperText, { color: theme.textTertiary }]}>
        {photos.length === 0
          ? 'Photos help showcase your experience'
          : `${maxPhotos - photos.length} more photo${maxPhotos - photos.length !== 1 ? 's' : ''} remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
  },
  maxText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  photoGrid: {
    height: 120,
  },
  photosScroll: {
    flex: 1,
  },
  photoContainer: {
    borderRadius: Spacing.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: '#fff',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  addButton: {
    borderRadius: Spacing.radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: Spacing.md,
  },
  addText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
});
