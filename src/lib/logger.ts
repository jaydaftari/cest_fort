type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const getMinLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined
  if (envLevel && envLevel in LOG_LEVELS) return envLevel
  return process.env.NODE_ENV === 'development' ? 'debug' : 'info'
}

const shouldLog = (level: LogLevel): boolean =>
  LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()]

const formatMessage = (
  level: LogLevel,
  module: string,
  message: string,
  data?: unknown,
): string => {
  const timestamp = new Date().toISOString()

  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify({
      timestamp,
      level,
      module,
      message,
      ...(data !== undefined ? { data } : {}),
    })
  }

  const prefix = `[${timestamp}] [${level.toUpperCase().padEnd(5)}] [${module}]`
  return data !== undefined
    ? `${prefix} ${message} ${JSON.stringify(data, null, 0)}`
    : `${prefix} ${message}`
}

const createLogger = (module: string) => ({
  debug: (message: string, data?: unknown) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', module, message, data))
  },
  info: (message: string, data?: unknown) => {
    if (shouldLog('info')) console.info(formatMessage('info', module, message, data))
  },
  warn: (message: string, data?: unknown) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', module, message, data))
  },
  error: (message: string, data?: unknown) => {
    if (shouldLog('error')) console.error(formatMessage('error', module, message, data))
  },
})

export { createLogger }
export type { LogLevel }
