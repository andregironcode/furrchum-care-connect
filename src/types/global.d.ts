// Extend the Window interface to include Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, options?: {
        tags?: Record<string, string>;
        extra?: Record<string, unknown>;
      }) => void;
    };
  }
}

export {};
