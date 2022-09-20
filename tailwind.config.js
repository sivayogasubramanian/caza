/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
      },
      boxShadow: {
        top: '0 -1px 5px 2px rgba(0,0,0,0.1)',
        bottom: '0 1px 5px 2px rgba(0,0,0,0.1)',
        around: '1px 1px 2px 2px rgba(0,0,0,0.1)',
        bigAround: '2px 2px 15px 2px rgb(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
