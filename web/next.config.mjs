/** @type {import('next').NextConfig} */

import nextPWA from 'next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
  ...(process.env.STANDALONE_BUILD === 'true' ? { output: 'standalone' } : {}),
});

export default nextConfig;
