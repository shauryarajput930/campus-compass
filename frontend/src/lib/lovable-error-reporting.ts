/**
 * Error reporting utility stub.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") {
    console.error("[ErrorReport]", error, context);
  }
}