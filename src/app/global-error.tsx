"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.log(error);
    // Add context to the error for better debugging
    Sentry.setContext("global_error", {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    // Capture the error with enhanced context
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}