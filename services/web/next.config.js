/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Убираем basePath - работаем на субдомене
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  // Убираем env секцию - будем читать переменные в runtime через process.env
}

module.exports = nextConfig
