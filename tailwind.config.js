import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/react/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        hide: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(6px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          from: { opacity: '0', transform: 'translateX(-6px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        accordionOpen: {
          from: { height: '0px' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        accordionClose: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0px' },
        },
        dialogOverlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        dialogContentShow: {
          from: { opacity: '0', transform: 'translate(-50%, -45%) scale(0.95)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        hide: 'hide 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideDownAndFade: 'slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade: 'slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade: 'slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        accordionOpen: 'accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)',
        accordionClose: 'accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)',
        dialogOverlayShow: 'dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        dialogContentShow: 'dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
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
        ink: {
          950: '#0A0A0B',
          900: '#111113',
          800: '#1A1B1E',
          700: '#26272B',
          600: '#35363C',
        },
        mist: {
          50: '#FAFAFC',
          100: '#F2F3F8',
          200: '#E7E8F2',
          300: '#D5D7E4',
          400: '#AFB3C6',
          500: '#868B9C',
        },
        brand: {
          50: '#F8FDEB',
          100: '#EEF9CF',
          200: '#DDF3A3',
          300: '#C9EC6D',
          400: '#B4E93E',
          500: '#A3E623',
          600: '#85C412',
          700: '#658F13',
          800: '#4D6D15',
          900: '#3E5716',
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
