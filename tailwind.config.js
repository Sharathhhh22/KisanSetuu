/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kisan: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        earth: {
          50: '#FDFBF7',
          100: '#F7F2E9',
          200: '#EFE6D5',
          700: '#8A6841',
          800: '#644B2C',
        }
      }
    },
  },
  plugins: [],
}
