import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Soft, editorial gallery palette
        canvas: '#f6f5f2', // off-white background
        paper: '#fbfaf8',
        wall: '#efedea',
        ink: '#1a1a1a', // soft black
        muted: '#8a8782',
        line: '#e2e0db',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '0.18em',
      },
      transitionTimingFunction: {
        // Apple-like easing
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
