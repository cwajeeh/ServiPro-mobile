/**
 * Logs unexpected errors in development without noisy production console output.
 */
export function logUnexpectedError(context: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
}

/** Debug-only console.log; no-ops in production builds. */
export function devDebug(...args: unknown[]): void {
  if (__DEV__) {
    console.log(...args);
  }
}
