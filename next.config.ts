import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // shortcut: this PC's current LAN address, update it if the network hands out another one.
  allowedDevOrigins: ['10.10.11.13'],
};

export default nextConfig;
