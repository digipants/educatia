import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '16kb' }
  },
  async headers() {
    return [
      {
        source: '/admin/content/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, no-cache, max-age=0, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }
        ]
      },
      {
        source: '/admin/applications/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, no-cache, max-age=0, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
};

export default nextConfig;
