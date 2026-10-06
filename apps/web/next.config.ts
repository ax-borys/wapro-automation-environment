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
   async rewrites() {
      return [
         {
            source: '/api/:path*',
            destination: `${process.env.API_URL ?? 'http://localhost:8082'}/:path*`,
         },
      ];
   },
};

export default nextConfig;
