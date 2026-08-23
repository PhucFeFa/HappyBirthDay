import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow framer-motion and firebase to run without issues
  transpilePackages: [],
  // Disable strict mode for framer-motion compat
  reactStrictMode: false,
};

export default nextConfig;
