import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@kolbo/auth', '@kolbo/database', '@kolbo/ui'],
  output: 'standalone',
};

export default nextConfig;
