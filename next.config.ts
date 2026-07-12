import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.71.61.72'],
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
