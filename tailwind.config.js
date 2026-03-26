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
            faint: '#eef2ff',
            muted: '#c7d2fe',
            subtle: '#a5b4fc',
            DEFAULT: '#4f46e5',
            emphasis: '#4338ca',
            inverted: '#ffffff',
          },
          background: {
            muted: '#f9fafb',
            subtle: '#f3f4f6',
            DEFAULT: '#ffffff',
            emphasis: '#374151',
          },
          border: {
            DEFAULT: '#e5e7eb',
          },
          ring: {
            DEFAULT: '#e5e7eb',
          },
          content: {
            subtle: '#9ca3af',
            DEFAULT: '#6b7280',
            emphasis: '#374151',
            strong: '#111827',
            inverted: '#ffffff',
          },
        },
        'dark-tremor': {
          brand: {
            faint: '#0b1229',
            muted: '#172554',
            subtle: '#1d4ed8',
            DEFAULT: '#3b82f6',
            emphasis: '#60a5fa',
            inverted: '#030712',
          },
          background: {
            muted: '#131a2b',
            subtle: '#1f2937',
            DEFAULT: '#111827',
            emphasis: '#d1d5db',
          },
          border: {
            DEFAULT: '#374151',
          },
          ring: {
            DEFAULT: '#374151',
          },
          content: {
            subtle: '#9ca3af',
            DEFAULT: '#d1d5db',
            emphasis: '#f9fafb',
            strong: '#f9fafb',
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
