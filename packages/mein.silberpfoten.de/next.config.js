const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA({
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  pwa: {
    dest: 'public',
    runtimeCaching,
    disable: process.env.NODE_ENV === 'development',
  },
  // reactStrictMode: true,
})