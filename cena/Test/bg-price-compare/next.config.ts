import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', 
  images: {
    unoptimized: true, 
  },
  basePath: '/cena', 
};

export default nextConfig;