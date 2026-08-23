import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow framer-motion and firebase to run without issues
  transpilePackages: [],
  // Disable strict mode for framer-motion compat
  reactStrictMode: false,

  // HTTP Security Headers (Chống XSS, Clickjacking, MIME Sniffing)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
