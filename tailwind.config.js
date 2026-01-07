/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
      },
      colors: {
        olive: {
          50: '#f4f5eb',
          100: '#e2e6c4',
          200: '#c5ce94',
          300: '#a8b56a',
          400: '#8a9a4a',
          500: '#6b7a35',
          600: '#5c6830',
          700: '#4a5428',
          800: '#3d4422',
          900: '#2d3319',
        },
        sand: '#f5f3ed',
        primary: {
          50: '#f4f5eb',
          100: '#e2e6c4',
          200: '#c5ce94',
          300: '#a8b56a',
          400: '#8a9a4a',
          500: '#6b7a35',
          600: '#5c6830',
          700: '#4a5428',
          800: '#3d4422',
          900: '#2d3319',
        },
        accent: {
          50: '#f4f5eb',
          100: '#e2e6c4',
          200: '#c5ce94',
          300: '#a8b56a',
          400: '#8a9a4a',
          500: '#6b7a35',
          600: '#5c6830',
          700: '#4a5428',
          800: '#9a3412',
          900: '#7c2d12',
        }
      }
    },
  },
  plugins: [],
}
