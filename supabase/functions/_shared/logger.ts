// ── Structured logger for edge functions ────────────────────────────────────
// Provides consistent, structured JSON logging with request IDs, timing, and
// severity levels. All edge functions should use this instead of raw console.*.
//
// Usage:
//   const log = createLogger('my-function');
//   const reqLog = log.withRequest(req);  // adds request_id + method + path
//   reqLog.info('starting', { userId: '...' });
//   reqLog.warn('slow query', { durationMs: 500 });
//   reqLog.error('failed', { error: err });
//   reqLog.done(200, { extra: 'data' });  // logs response + total duration

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  function: string;
  request_id?: string;
  method?: string;
  path?: string;
  message: string;
  duration_ms?: number;
  [key: string]: unknown;
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function writeLog(entry: LogEntry) {
  switch (entry.level) {
    case 'error':
      console.error(formatEntry(entry));
      break;
    case 'warn':
      console.warn(formatEntry(entry));
      break;
    case 'debug':
      console.debug(formatEntry(entry));
      break;
    default:
      console.log(formatEntry(entry));
  }
}

export interface RequestLogger {
  debug(message: string, extra?: Record<string, unknown>): void;
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  error(message: string, extra?: Record<string, unknown>): void;
  /** Log the final response status and total request duration. */
  done(status: number, extra?: Record<string, unknown>): void;
}

export interface Logger {
  debug(message: string, extra?: Record<string, unknown>): void;
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  error(message: string, extra?: Record<string, unknown>): void;
  /** Create a child logger scoped to a specific HTTP request. */
  withRequest(req: Request): RequestLogger;
}

export function createLogger(functionName: string): Logger {
  function log(level: LogLevel, message: string, extra?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      function: functionName,
      message,
      ...extra,
    };
    writeLog(entry);
  }

  return {
    debug: (msg, extra) => log('debug', msg, extra),
    info:  (msg, extra) => log('info', msg, extra),
    warn:  (msg, extra) => log('warn', msg, extra),
    error: (msg, extra) => log('error', msg, extra),

    withRequest(req: Request): RequestLogger {
      const requestId = crypto.randomUUID().slice(0, 8);
      const url = new URL(req.url);
      const method = req.method;
      const path = url.pathname;
      const startTime = Date.now();

      function rlog(level: LogLevel, message: string, extra?: Record<string, unknown>) {
        const entry: LogEntry = {
          timestamp: new Date().toISOString(),
          level,
          function: functionName,
          request_id: requestId,
          method,
          path,
          message,
          duration_ms: Date.now() - startTime,
          ...extra,
        };
        writeLog(entry);
      }

      // Log request received
      rlog('info', 'request received');

      return {
        debug: (msg, extra) => rlog('debug', msg, extra),
        info:  (msg, extra) => rlog('info', msg, extra),
        warn:  (msg, extra) => rlog('warn', msg, extra),
        error: (msg, extra) => rlog('error', msg, extra),
        done(status: number, extra?: Record<string, unknown>) {
          rlog('info', 'request completed', { status, ...extra });
        },
      };
    },
  };
}

/** Safely extract a loggable error object (message + name, no stack in prod). */
export function toErrorDetail(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { error: err.message, error_name: err.name };
  }
  return { error: String(err) };
}
