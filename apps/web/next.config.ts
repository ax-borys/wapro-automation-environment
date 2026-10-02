import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   output: 'standalone',
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: '*.allegroimg.com',
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
