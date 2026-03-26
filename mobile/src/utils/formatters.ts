import { format, parseISO, formatDistanceToNow } from 'date-fns'

export function formatPrice(price: number | undefined, currency: string = 'USD'): string {
  if (price === undefined || price === null) return 'N/A'
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(price)
}

export function formatDate(date: string | Date, fmt: string = 'MMM dd, yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt)
  } catch (error) {
    console.error('Failed to format date', error)
    return 'Invalid date'
  }
}

export function formatTime(time: string, fmt: string = 'h:mm a'): string {
  try {
    // Assuming time is in HH:mm format
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10))
    return format(date, fmt)
  } catch (error) {
    console.error('Failed to format time', error)
    return 'Invalid time'
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const startStr = format(start, 'MMM dd')
    const endStr = format(end, 'MMM dd, yyyy')
    return `${startStr} - ${endStr}`
  } catch (error) {
    console.error('Failed to format date range', error)
    return 'Invalid date range'
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch (error) {
    console.error('Failed to format relative time', error)
    return 'Unknown'
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}m`
  }
}

export function formatParticipants(count: number): string {
  return count === 1 ? '1 person' : `${count} people`
}

export function formatDifficulty(difficulty: string): string {
  const difficultyCaps: Record<string, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  }
  return difficultyCaps[difficulty] || difficulty
}
