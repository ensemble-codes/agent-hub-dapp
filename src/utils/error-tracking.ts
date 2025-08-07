import posthog from "posthog-js";

// Manual error reporting
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$exception', {
      $exception_message: error.message,
      $exception_type: error.name,
      $exception_stack_trace: error.stack,
      ...context
    });
  }
};

// Manual message reporting
export const captureMessage = (message: string, level: "info" | "warning" | "error" = "info") => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('log_message', {
      message,
      level
    });
  }
};

// Set user context
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(user.id, {
      email: user.email,
      username: user.username
    });
  }
};

// Set extra context
export const setExtra = (key: string, value: any) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.setPersonProperties({
      [key]: value
    });
  }
};

// Set tag
export const setTag = (key: string, value: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.setPersonProperties({
      [`tag_${key}`]: value
    });
  }
};

// Add breadcrumb (PostHog doesn't have direct breadcrumb support, so we'll track as custom event)
export const addBreadcrumb = (breadcrumb: { message?: string; category?: string; level?: string; data?: any }) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('breadcrumb', {
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level,
      data: breadcrumb.data
    });
  }
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