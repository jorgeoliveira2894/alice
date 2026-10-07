import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CarPlay-like dark palette, high contrast for daylight in the car
        base: '#0b0b0d',
        panel: '#1c1c1f',
        raised: '#2a2a2e',
        line: '#3a3a3f',
        dim: '#9a9aa2',
        accent: '#0a84ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
