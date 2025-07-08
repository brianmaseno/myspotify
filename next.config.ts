import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'i.scdn.co',      // Spotify images
      'i.ytimg.com',    // YouTube thumbnails
      'img.youtube.com' // Additional YouTube image domain
    ]
  }
};

export default nextConfig;
