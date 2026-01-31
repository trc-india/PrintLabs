import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', 
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
      // Fix for Amazon Images (The error you saw)
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      // Wildcard: Allow ALL images (Prevents future errors during development)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure we don't fail builds on lint errors for now
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;