// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    // Increase timeout for Cloudinary images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optional: Disable image optimization in development
    ...(process.env.NODE_ENV === 'development' && {
      unoptimized: true
    })
  },
  // Increase timeout for API routes
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  // Optional: Increase static generation timeout
  staticPageGenerationTimeout: 1000,
}

export default nextConfig;