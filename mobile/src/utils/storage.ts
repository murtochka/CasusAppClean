import AsyncStorage from '@react-native-async-storage/async-storage'

class StorageService {
  private prefix = '@casusapp:'

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(this.prefix + key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Failed to get item from storage: ${key}`, error)
      return null
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(this.prefix + key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error)
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.error(`Failed to remove item from storage: ${key}`, error)
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const appKeys = keys.filter((key) => key.startsWith(this.prefix))
      await AsyncStorage.multiRemove(appKeys)
    } catch (error) {
      console.error('Failed to clear storage', error)
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      return keys
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.substring(this.prefix.length))
    } catch (error) {
      console.error('Failed to get all keys from storage', error)
      return []
    }
  }
}

export const storageService = new StorageService()
