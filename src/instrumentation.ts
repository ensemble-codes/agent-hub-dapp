import * as Sentry from '@sentry/nextjs';

export async function register() {
  // No server-side Sentry config needed for client-only app
}

export const onRequestError = Sentry.captureRequestError;
