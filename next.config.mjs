import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Keep DB drivers out of the server bundle — bundling often breaks Mongoose on Vercel (500 on every API route). */
  serverExternalPackages: ['mongoose', 'mongodb', 'bson'],
  // Parent folders may contain other lockfiles; pin Turbopack to this app.
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [{ source: '/updates', destination: '/', permanent: false }];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
