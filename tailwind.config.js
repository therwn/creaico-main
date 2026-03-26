import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/lib/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
    './node_modules/@tremor/react/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tremor: {
          brand: {
            faint: '#f5ffe0',
            muted: '#e4ff9a',
            subtle: '#d4ff59',
            DEFAULT: '#c2ff29',
            emphasis: '#9ad014',
            inverted: '#081004',
          },
          background: {
            muted: '#f8faf7',
            subtle: '#eff3ea',
            DEFAULT: '#ffffff',
            emphasis: '#182112',
          },
          border: {
            DEFAULT: '#dde5d5',
          },
          ring: {
            DEFAULT: '#d4e0cc',
          },
          content: {
            subtle: '#7e8977',
            DEFAULT: '#5f685b',
            emphasis: '#23301a',
            strong: '#10170d',
            inverted: '#ffffff',
          },
        },
        'dark-tremor': {
          brand: {
            faint: '#121a08',
            muted: '#23330d',
            subtle: '#506d18',
            DEFAULT: '#c2ff29',
            emphasis: '#d6ff68',
            inverted: '#050704',
          },
          background: {
            muted: '#090b08',
            subtle: '#11150f',
            DEFAULT: '#050704',
            emphasis: '#e6eadf',
          },
          border: {
            DEFAULT: '#1d2319',
          },
          ring: {
            DEFAULT: '#222a1e',
          },
          content: {
            subtle: '#899283',
            DEFAULT: '#c7d0c1',
            emphasis: '#eef3e7',
            strong: '#f7fbf2',
            inverted: '#000000',
          },
        },
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
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.35)',
        'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.35), 0 1px 2px -1px rgb(0 0 0 / 0.35)',
        'dark-tremor-dropdown': '0 18px 40px -12px rgb(0 0 0 / 0.45)',
        soft: '0 18px 48px rgba(15, 23, 42, 0.12)',
        'soft-dark': '0 24px 60px rgba(2, 6, 23, 0.45)',
      },
      borderRadius: {
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'tremor-label': ['0.75rem', { lineHeight: '1rem' }],
        'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
      },
    },
  },
  plugins: [forms],
}
