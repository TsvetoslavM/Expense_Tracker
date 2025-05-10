/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    // This ensures the API URL is available at build time and runtime
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://expense-tracker-api-un6a.onrender.com'
      : 'http://localhost:8000',
  },
}

module.exports = nextConfig