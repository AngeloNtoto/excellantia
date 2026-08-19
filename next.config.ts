import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['172.25.77.72'],
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
