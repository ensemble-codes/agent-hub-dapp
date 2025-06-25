import type { NextConfig } from "next";

// Injected content via Sentry wizard below will be preserved by the wizard
// and will not be overwritten by the wizard

const nextConfig: NextConfig = {
  /* config options here */
  
  // Enable source maps for better error tracking
  productionBrowserSourceMaps: true,
  
  // Sentry configuration
  sentry: {
    // Suppresses source map uploading logs during build
    hideSourceMaps: true,
    
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
};

export default nextConfig;
