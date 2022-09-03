const withPWA = require('next-pwa')({
    dest: 'public',
});

module.exports = withPWA({
    pwa: {
        dest: 'public',
        register: true,
        disable: process.env.NODE_ENV === 'development',
        skipWaiting: true,
    },
});
