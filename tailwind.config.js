/* eslint-disable-next-line */
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.role-sankey-label': {
          transformBox: 'fill-box',
          transform: 'rotate(90deg)',
        },
      });
    }),
  ],
  corePlugins: {
    preflight: false,
  },
};
