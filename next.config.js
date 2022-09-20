/* eslint-disable */

const withPWA = require('next-pwa')({
  dest: 'public',
});

/* eslint-enable */

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    disable: false,
    skipWaiting: true,
  },
});
