/** @type {import('next').NextConfig} */
const nextConfig = {
    trustHost: true,
    reactStrictMode: true,
    images: {
      formats: ['image/avif', 'image/webp'],
      remotePatterns: [
        // add https://lh3.googleusercontent.com/* patterns here
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
          port: '',
          pathname: '/**',
        },
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
