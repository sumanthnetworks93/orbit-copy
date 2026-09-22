import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        card: 'var(--card)',
        accent: 'var(--accent)',
        accentink: 'var(--accent-ink)',
        warn: 'var(--warn)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' },
    },
  },
  plugins: [],
};

export default config;
