import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack for production builds to avoid compatibility issues
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  // Ensure proper handling of AI SDK components
  transpilePackages: ["@ai-sdk/react", "@ai-sdk/openai"],
};

export default nextConfig;
