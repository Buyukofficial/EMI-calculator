/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uae: {
          red: '#c8102e',
          green: '#00732f',
          black: '#111111',
          gold: '#c5a059',
          goldLight: '#f4ede1'
        }
      }
    },
  },
  plugins: [],
}
