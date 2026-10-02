/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Bebas Neue"', '"Anton"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        marvel: {
          red:    '#E23636',
          dark:   '#0A0A0F',
          darker: '#050508',
          gold:   '#F5A623',
        },
      },
    },
  },
  plugins: [],
}
