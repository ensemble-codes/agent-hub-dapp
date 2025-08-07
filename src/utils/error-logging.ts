import posthog from "posthog-js";

// Enhanced error logging that captures to both console and PostHog
export const logError = (error: Error | string, context?: Record<string, any>) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorObject = typeof error === 'string' ? new Error(error) : error;

  // Log to console for immediate debugging
  console.error('Error logged to PostHog:', errorMessage, context);

  // Capture in PostHog
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$exception', {
      $exception_message: errorObject.message,
      $exception_type: errorObject.name,
      $exception_stack_trace: errorObject.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...context
    });
  }
};

// Enhanced console.error replacement
export const consoleError = (message: string, ...args: any[]) => {
  // Log to console
  console.error(message, ...args);

  // Capture in PostHog
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('console_error', {
      message,
      args: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ),
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }
};

// Enhanced console.warn replacement
export const consoleWarn = (message: string, ...args: any[]) => {
  // Log to console
  console.warn(message, ...args);

  // Capture in PostHog
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('console_warning', {
      message,
      args: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ),
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }
};

// Utility to wrap async functions and capture errors
export const withErrorLogging = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error, {
        function_name: fn.name,
        ...context
      });
      throw error; // Re-throw to maintain original behavior
    }
  };
};

// Utility to wrap sync functions and capture errors
export const withSyncErrorLogging = <T extends any[], R>(
  fn: (...args: T) => R,
  context?: Record<string, any>
) => {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      logError(error as Error, {
        function_name: fn.name,
        ...context
      });
      throw error; // Re-throw to maintain original behavior
    }
  };
};