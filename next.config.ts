import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for production builds (Turbopack is still experimental for prod)
  // Turbopack will still be used for development (faster hot reload)
  experimental: {
    // Disable Turbopack for production builds
    turbo: undefined,
  },

  // Optimize for production
  reactStrictMode: true,

  // Allow images from external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Ensure Next.js uses webpack bundler for build
  webpack: (config, { isServer }) => {
    // Custom webpack config if needed
    return config;
  },
};

export default nextConfig;
