// next.config.ts

import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your existing Next.js config options might be here.
  // We are adding the 'webpack' configuration below.

  webpack(config) {
    // This rule allows you to import SVGs as React components.
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;