// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://7b387d57b822c9b7572f7f872fbf1b90@o4509558875684864.ingest.de.sentry.io/4509558876995664",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true, // Enable for local testing
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;