import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'a.allegroimg.com',
         },
         {
            protocol: 'http',
            hostname: 'localhost',
            pathname: '/public/**',
            port: '8082',
         },
      ],
      dangerouslyAllowLocalIP: true,
   },
};

export default nextConfig;
