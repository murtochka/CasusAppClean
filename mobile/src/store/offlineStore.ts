import { create } from 'zustand'
import { OfflineAction } from '../types/offline'
import { offlineQueueManager } from '../utils/offlineQueue'
import { logger } from '../utils/logger'
import NetInfo from '@react-native-community/netinfo'

export interface OfflineStoreState {
  isOnline: boolean
  queue: OfflineAction[]
  isProcessing: boolean
  processedCount: number

  // Actions
  initNetworkListener: () => void
  setOnlineStatus: (isOnline: boolean) => void
  enqueueAction: (action: OfflineAction) => Promise<void>
  getQueue: () => Promise<OfflineAction[]>
  clearQueue: () => Promise<void>
  setProcessing: (processing: boolean) => void
  incrementProcessedCount: () => void
  resetProcessedCount: () => void
}

export const useOfflineStore = create<OfflineStoreState>((set, get) => ({
  isOnline: true,
  queue: [],
  isProcessing: false,
  processedCount: 0,

  initNetworkListener: () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = !!(state.isConnected && state.isInternetReachable)
      get().setOnlineStatus(isConnected)
      logger.info('Network status changed', { isConnected, type: state.type })
    })

    // Initial check
    NetInfo.fetch().then((state) => {
      const isConnected = !!(state.isConnected && state.isInternetReachable)
      get().setOnlineStatus(isConnected)
    })

    return unsubscribe
  },

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline })
    if (isOnline && get().queue.length > 0) {
      logger.info('Back online, offline queue ready for processing', { queueSize: get().queue.length })
    }
  },

  enqueueAction: async (action: OfflineAction) => {
    await offlineQueueManager.enqueue(action)
    const queue = await get().getQueue()
    set({ queue })
    logger.info('Action enqueued', { actionId: action.id, queueSize: queue.length })
  },

  getQueue: async () => {
    const queue = await offlineQueueManager.getQueue()
    return queue
  },

  clearQueue: async () => {
    await offlineQueueManager.clear()
    set({ queue: [], processedCount: 0 })
    logger.info('Offline queue cleared')
  },

  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing })
  },

  incrementProcessedCount: () => {
    set({ processedCount: get().processedCount + 1 })
  },

  resetProcessedCount: () => {
    set({ processedCount: 0 })
  },
}))
