/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zakat Platform Brand Colors
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Islamic Green shades from logo
        islamic: {
          light: '#6B9B3E',
          DEFAULT: '#4A7C42',
          dark: '#2D5A27',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-rtl')],
  // RTL support
  darkMode: 'class',
  // Enable RTL mode based on data-dir attribute
  corePlugins: {
    // Keep core plugins enabled
  },
}
