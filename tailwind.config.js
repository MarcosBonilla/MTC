/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdead6',
          200: '#fad2ac',
          300: '#f6b177',
          400: '#f18640',
          500: '#ed661a',
          600: '#df4e10',
          700: '#b83a10',
          800: '#932f14',
          900: '#772914',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slideInUp': 'slideInUp 0.6s ease-out',
        'slideInLeft': 'slideInLeft 0.6s ease-out', 
        'slideInRight': 'slideInRight 0.6s ease-out',
        'pulse-custom': 'pulse 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}