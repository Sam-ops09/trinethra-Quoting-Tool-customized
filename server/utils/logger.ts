/**
 * Production-safe logging utility.
 * 
 * In production, only logs errors and warnings.
 * In development, logs everything for debugging.
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Debug level log - only in development
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info level log - only in development
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warning level log - always
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error level log - always
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Stock operation logs - only in development
   */
  stock: (message: string) => {
    if (isDev) {
      console.log(message);
    }
  },
};

export default logger;
