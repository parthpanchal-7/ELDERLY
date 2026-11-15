import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#193C47',
          fg: '#FFFFFF',
        },
        teal: {
          DEFAULT: '#147D75',
          light: '#1a9e94',
          dark: '#0f5e57',
        },
        mint: {
          DEFAULT: '#E6F5EF',
          dark: '#c8e8da',
        },
        canvas: {
          DEFAULT: '#F9F7F1',
          dark: '#ece9e0',
        },
        accent: {
          DEFAULT: '#D56A39',
          light: '#e08057',
          dark: '#b55a2e',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Accessible minimum text sizes
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },
      spacing: {
        // Minimum 48px touch targets
        '12': '3rem',
        '14': '3.5rem',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(25, 60, 71, 0.08)',
        'card-hover': '0 4px 16px rgba(25, 60, 71, 0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
