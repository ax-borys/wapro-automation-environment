import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'a.allegroimg.com',
         },
      ],
   },
};

export default nextConfig;
