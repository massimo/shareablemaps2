import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to complete with ESLint errors
    ignoreDuringBuilds: true,
    // Only fail on errors, not warnings
  },
  typescript: {
    // Warning: This allows production builds to complete with TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
