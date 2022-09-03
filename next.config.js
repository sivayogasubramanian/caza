/* eslint-disable */

const withPWA = require('next-pwa')({
  dest: 'public',
});

/* eslint-enable */

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: false,
    disable: process.env.NODE_ENV === 'development',
    skipWaiting: true,
  },
});
