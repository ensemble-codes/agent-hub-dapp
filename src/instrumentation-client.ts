import posthog from "posthog-js"
import * as Sentry from "@sentry/nextjs";

// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

Sentry.init({
  dsn: "https://7b387d57b822c9b7572f7f872fbf1b90@o4509558875684864.ingest.de.sentry.io/4509558876995664",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true, // Enable for local testing
});

// Global error listeners to catch console errors
if (typeof window !== 'undefined') {

  // Initialize PostHog for client-side instrumentation (only in production)
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      defaults: '2025-05-24',
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
      debug: false,
    });
  }
  
  // Store original console methods before overriding
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  originalConsoleLog('Sentry instrumentation loaded - console override active');
  
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    originalConsoleLog('Global error caught:', event.error);
    Sentry.captureException(event.error || new Error(event.message), {
      tags: { source: 'global_error_listener' },
      contexts: {
        error: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      }
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    originalConsoleLog('Unhandled rejection caught:', event.reason);
    Sentry.captureException(event.reason, {
      tags: { source: 'unhandled_rejection' }
    });
  });

  // Override console.error to capture to Sentry
  console.error = (...args) => {
    originalConsoleLog('Console.error intercepted:', args);
    // Call original console.error
    originalConsoleError.apply(console, args);
    
    // Capture in Sentry
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    Sentry.captureMessage(`Console Error: ${message}`, 'error');
  };

  // Override console.warn to capture to Sentry
  console.warn = (...args) => {
    originalConsoleLog('Console.warn intercepted:', args);
    // Call original console.warn
    originalConsoleWarn.apply(console, args);
    
    // Capture in Sentry
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    Sentry.captureMessage(`Console Warning: ${message}`, 'warning');
  };
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;