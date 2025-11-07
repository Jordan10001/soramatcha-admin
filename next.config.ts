import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // increase body size limit to allow image uploads via Server Actions
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
