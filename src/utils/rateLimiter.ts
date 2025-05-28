/**
 * Simple client-side rate limiter to prevent excessive API calls
 */

interface RateLimitEntry {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 3, windowMs: number = 5 * 60 * 1000) { // 3 attempts per 5 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry) {
      this.storage.set(key, { timestamp: now, count: 1 });
      return true;
    }

    // Reset if window has passed
    if (now - entry.timestamp > this.windowMs) {
      this.storage.set(key, { timestamp: now, count: 1 });
      return true;
    }

    // Check if under limit
    if (entry.count < this.maxAttempts) {
      entry.count++;
      return true;
    }

    return false;
  }

  getRemainingTime(key: string): number {
    const entry = this.storage.get(key);
    if (!entry) return 0;
    
    const elapsed = Date.now() - entry.timestamp;
    const remaining = this.windowMs - elapsed;
    return Math.max(0, remaining);
  }

  reset(key: string): void {
    this.storage.delete(key);
  }
}

// Create instances for different operations
export const passwordResetLimiter = new RateLimiter(2, 5 * 60 * 1000); // 2 attempts per 5 minutes
export const signupLimiter = new RateLimiter(3, 10 * 60 * 1000); // 3 attempts per 10 minutes

/**
 * Format remaining time in human-readable format
 */
export function formatRemainingTime(ms: number): string {
  const minutes = Math.ceil(ms / (60 * 1000));
  if (minutes <= 1) return 'less than a minute';
  return `${minutes} minutes`;
} 