const package = require('./package.json')

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', 
})

module.exports = withPWA({
  env: {
    NEXT_PUBLIC_VERSION: package.version,
  },
  output: 'standalone',
})