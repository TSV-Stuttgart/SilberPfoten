const package = require('./package.json')

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', 
})

module.exports = withPWA({
  env: {
    NEXT_PUBLIC_VERSION: package.version,
    // NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
    PGDATABASE: process.env.PGDATABASE,
    PGPASSWORD: process.env.PGPASSWORD,
    PGPORT: process.env.PGPORT,
    PGUSER: process.env.PGUSER,
  },
  output: 'standalone',
})