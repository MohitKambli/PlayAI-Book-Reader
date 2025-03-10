import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Match any request that starts with /api/
        destination: "http://localhost:3001/api/:path*", // Forward the request to the backend server
      },
    ];
  },
};

export default nextConfig;
