/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media1.giphy.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname:   "lh3.googleusercontent.com", 
        port: '',
        pathname: '/**',
      }
    ]
  },
  async headers() {
    return [
        {
            source: '/(.*)?', // Matches all pages
            headers: [
                {
                    key: 'X-Frame-Options',
                    value: 'DENY',
                }
            ]
        }
    ]
  }
};

module.exports = nextConfig;