/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        primary: {
          one: '#2593FC',
          two: '#1A49A6',
          three: '#CEEDFF',
          four: '#185ADB',
        },
      },
      boxShadow: {
        top: '0 -1px 5px 2px rgba(0,0,0,0.1)',
        bottom: '0 1px 5px 2px rgba(0,0,0,0.1)',
        around: '1px 1px 2px 2px rgba(0,0,0,0.1)',
        bigAround: '2px 2px 15px 2px rgb(0,0,0,0.3)',
        primary: '0 2px 5px 2px rgba(144,170,235,0.6)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
