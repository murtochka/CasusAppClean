import { useEffect } from 'react'
import { useOfflineStore } from '@/store/offlineStore'

export function useNetworkStatus() {
  const { isOnline, initNetworkListener } = useOfflineStore()

  useEffect(() => {
    initNetworkListener()
    // NetInfo's unsubscribe is handled internally by the store
  }, [initNetworkListener])

  return {
    isOnline,
  }
}
