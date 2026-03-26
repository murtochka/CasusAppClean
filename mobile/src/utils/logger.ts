type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface StartupMetrics {
  phase: string
  duration_ms: number
  timestamp: string
}

class Logger {
  private isDevelopment = __DEV__
  private startupMarks: Record<string, number> = {}

  debug = (message: string, data?: unknown): void => {
    this.log('debug', message, data)
  }

  info = (message: string, data?: unknown): void => {
    this.log('info', message, data)
  }

  warn = (message: string, data?: unknown): void => {
    this.log('warn', message, data)
  }

  error = (message: string, data?: unknown): void => {
    this.log('error', message, data)
  }

  /**
   * Track startup performance metrics
   * Records timing for key initialization phases
   */
  startupMetrics = (phase: string): void => {
    if (!this.isDevelopment) return

    const now = Date.now()
    const previousPhase = Object.keys(this.startupMarks).pop()
    const startTime = previousPhase ? this.startupMarks[previousPhase] : this.startupMarks['_start'] || now

    const durationMs = now - startTime
    const metrics: StartupMetrics = {
      phase,
      duration_ms: Math.round(durationMs * 100) / 100, // 2 decimal places
      timestamp: new Date().toISOString(),
    }

    this.startupMarks[phase] = now

    // Log as structured JSON for easy parsing
    console.log(`[STARTUP_METRICS] ${JSON.stringify(metrics)}`)
  }

  /**
   * Mark the beginning of startup sequence
   * Call this at app entry point
   */
  markStartupStart = (): void => {
    if (!this.isDevelopment) return
    this.startupMarks['_start'] = Date.now()
    console.log('[STARTUP_START]', new Date().toISOString())
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.isDevelopment) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    const logMessage = `${prefix} ${message}`

    const hasData = data !== undefined

    switch (level) {
      case 'debug':
        hasData ? console.debug(logMessage, data) : console.debug(logMessage)
        break
      case 'info':
        hasData ? console.log(logMessage, data) : console.log(logMessage)
        break
      case 'warn':
        hasData ? console.warn(logMessage, data) : console.warn(logMessage)
        break
      case 'error':
        hasData ? console.error(logMessage, data) : console.error(logMessage)
        break
    }
  }
}

export const logger = new Logger()
