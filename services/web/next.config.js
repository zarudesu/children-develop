/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Отключаем standalone режим - возвращаемся к обычному
  // output: 'standalone',
  compress: true,
  poweredByHeader: false,
  // Временно отключаем TypeScript проверки для продакшен билда
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
