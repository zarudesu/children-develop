/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    PDF_SERVICE_URL: process.env.PDF_SERVICE_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig