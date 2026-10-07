import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // LEBLON: carvão quente + creme
        ink: '#171715',
        cream: '#FFFBF4',
        sand: '#F3EDE3',
        line: '#E4DDD1',
        stone: '#8C877E',
        smoke: '#2A2A27',
        clay: '#A4532E', // pedido de alterações
      },
      fontFamily: {
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.22em',
        wide2: '0.32em',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
