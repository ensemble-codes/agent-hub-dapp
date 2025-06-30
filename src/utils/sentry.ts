import * as Sentry from "@sentry/nextjs";

// Manual error reporting
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  });
};

// Manual message reporting
export const captureMessage = (message: string, level: Sentry.SeverityLevel = "info") => {
  Sentry.captureMessage(message, level);
};

// Set user context
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// Set extra context
export const setExtra = (key: string, value: any) => {
  Sentry.setExtra(key, value);
};

// Set tag
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

// Add breadcrumb
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Wrap async functions with error tracking
export const withErrorTracking = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      captureError(error as Error, {
        operation: operationName,
        args: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ),
      });
      throw error;
    }
  };
}; 