export interface ApiError {
  message: string
  code: string
  status: number
  details?: Record<string, any>
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface PaginationParams {
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  status: AsyncStatus
  data: T | null
  error: ApiError | null
}
