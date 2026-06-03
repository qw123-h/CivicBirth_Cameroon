import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00843D',
          light: '#1a9e52',
          dark: '#006b30',
        },
        secondary: {
          DEFAULT: '#CE1126',
          light: '#e5253e',
          dark: '#a50d1e',
        },
        accent: {
          DEFAULT: '#FCD116',
          light: '#fdda47',
          dark: '#e6b800',
        },
        surface: '#FFFFFF',
        background: '#F4F7F6',
        card: '#FFFFFF',
        dark: '#1A1A2E',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        h1: ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        xl: '16px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 14px 34px -14px rgba(0, 132, 61, 0.45)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
