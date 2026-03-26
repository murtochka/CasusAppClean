import { useOfflineStore } from '@/store/offlineStore'

export function useOfflineQueue() {
  const { isOnline, queue, isProcessing, enqueueAction, clearQueue, getQueue } = useOfflineStore()

  const queueSize = queue.length
  const hasQueuedActions = queueSize > 0

  return {
    isOnline,
    hasQueuedActions,
    queueSize,
    queue,
    isProcessing,
    enqueueAction,
    clearQueue,
    getQueue,
  }
}
