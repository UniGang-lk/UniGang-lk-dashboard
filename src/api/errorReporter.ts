/**
 * The Uni Gang Dashboard - Error Reporting Utility
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const reportDashboardError = (error: Error, context?: Record<string, any>) => {
  console.error('[Dashboard Error Tracker]', error, context);

  if (SENTRY_DSN && typeof window !== 'undefined') {
    try {
      const payload = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        extra: context,
      };

      navigator.sendBeacon?.(
        `${SENTRY_DSN}/api/errors`,
        JSON.stringify(payload)
      );
    } catch {
      // Fail safely
    }
  }
};
