import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@tanstack/react-query']
  },
  // Typescript config
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
