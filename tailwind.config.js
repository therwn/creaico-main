import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/lib/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7ffe5',
          100: '#ebffc0',
          200: '#ddff8e',
          300: '#ccff54',
          400: '#c2ff29',
          500: '#a7df13',
          600: '#81ad0b',
          700: '#607f0d',
          800: '#4f6611',
          900: '#435613',
        },
      },
      boxShadow: {
        soft: '0 18px 48px rgba(15, 23, 42, 0.12)',
        'soft-dark': '0 24px 60px rgba(2, 6, 23, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
}
