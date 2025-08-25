/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Настройки для деплоя в поддиректории
  basePath: '/children',
  assetPrefix: '/children',
  trailingSlash: true,
  // Настройки для продакшена
  output: 'standalone',
  // Оптимизации
  compress: true,
  poweredByHeader: false,
  env: {
    PDF_SERVICE_URL: process.env.PDF_SERVICE_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
