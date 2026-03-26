export type OfflineActionType = 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface OfflineAction {
  id: string
  endpoint: string
  method: OfflineActionType
  data?: any
  timestamp: number
  retries: number
  lastError?: string
}

export interface OfflineQueueState {
  queue: OfflineAction[]
  isProcessing: boolean
  processedCount: number
}

export interface NetworkState {
  isOnline: boolean
  isWifiEnabled: boolean
  type: string
}
