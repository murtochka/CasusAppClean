import { useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'

export interface PickedImage {
  uri: string
  width: number
  height: number
  type?: string
}

export function useImagePicker() {
  const pickImage = useCallback(async (options?: { allowsEditing?: boolean; aspect?: [number, number] }): Promise<PickedImage | null> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [4, 3],
        quality: 1,
      })

      if (result.canceled) {
        return null
      }

      const image = result.assets[0]
      return {
        uri: image.uri,
        width: image.width,
        height: image.height,
        type: image.type,
      }
    } catch (error) {
      console.error('Failed to pick image', error)
      return null
    }
  }, [])

  return { pickImage }
}
