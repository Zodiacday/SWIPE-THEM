import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production

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
