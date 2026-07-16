import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "i5.walmartimages.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "3dkulture.s3.ap-southeast-1.amazonaws.com" },
    ],
  },
};

export default nextConfig;
