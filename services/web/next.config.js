/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Убираем basePath - работаем на субдомене
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  env: {
    PDF_SERVICE_URL: process.env.PDF_SERVICE_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
