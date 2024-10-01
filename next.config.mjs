/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      formats: ['image/avif', 'image/webp'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img.logo.dev',
          port: '',
          pathname: '/**',
        },
      ],
    },
  }

export default nextConfig;
