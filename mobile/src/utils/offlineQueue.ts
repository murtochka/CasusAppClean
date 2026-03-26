import { storageService } from './storage'
import { OfflineAction } from '../types/offline'

const OFFLINE_QUEUE_KEY = 'offline_queue'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

class OfflineQueueManager {
  private queue: OfflineAction[] = []
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const stored = await storageService.getItem<OfflineAction[]>(OFFLINE_QUEUE_KEY)
      this.queue = stored || []
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize offline queue', error)
      this.queue = []
      this.isInitialized = true
    }
  }

  async enqueue(action: OfflineAction): Promise<void> {
    await this.initialize()
    this.queue.push(action)
    await this.persist()
  }

  async dequeue(): Promise<OfflineAction | undefined> {
    await this.initialize()
    const action = this.queue.shift()
    if (action) {
      await this.persist()
    }
    return action
  }

  async peek(): Promise<OfflineAction | undefined> {
    await this.initialize()
    return this.queue[0]
  }

  async getQueue(): Promise<OfflineAction[]> {
    await this.initialize()
    return [...this.queue]
  }

  async clear(): Promise<void> {
    this.queue = []
    await storageService.removeItem(OFFLINE_QUEUE_KEY)
  }

  async removeAction(id: string): Promise<void> {
    await this.initialize()
    this.queue = this.queue.filter((action) => action.id !== id)
    await this.persist()
  }

  async updateAction(id: string, updates: Partial<OfflineAction>): Promise<void> {
    await this.initialize()
    const index = this.queue.findIndex((action) => action.id === id)
    if (index !== -1) {
      this.queue[index] = { ...this.queue[index], ...updates }
      await this.persist()
    }
  }

  private async persist(): Promise<void> {
    try {
      await storageService.setItem(OFFLINE_QUEUE_KEY, this.queue)
    } catch (error) {
      console.error('Failed to persist offline queue', error)
    }
  }

  getQueueSize(): number {
    return this.queue.length
  }

  canRetry(retries: number): boolean {
    return retries < MAX_RETRIES
  }

  getRetryDelay(retries: number): number {
    return RETRY_DELAY * Math.pow(2, retries) // Exponential backoff
  }
}

export const offlineQueueManager = new OfflineQueueManager()
