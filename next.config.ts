/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.dicebear.com'],
  },
  typescript: {
    ignoreBuildErrors: true, // Cambia a true si quieres ignorar errores de TS en build
  },
  eslint: {
    ignoreDuringBuilds: true, // Cambia a true si quieres ignorar errores de ESLint
  }
}

module.exports = nextConfig
