const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA({
  env: {
    NEXT_PUBLIC_VERSION: package.version,
  },
  experimental: {
    outputStandalone: true,
  },
  pwa: {
    dest: 'public',
    runtimeCaching,
    disable: process.env.NODE_ENV === 'development',
  },
  // reactStrictMode: true,
})