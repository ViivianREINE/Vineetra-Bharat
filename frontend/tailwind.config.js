/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        /* Theme-aware tokens — driven by CSS vars */
        bg: {
          DEFAULT: 'var(--color-bg)',
          card:    'var(--color-bg-card)',
          elevated:'var(--color-bg-elevated)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted:   'var(--color-text-muted)',
          dim:     'var(--color-text-dim)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light:   'var(--color-accent-light)',
          dark:    'var(--color-accent-dark)',
          glow:    'var(--glow-bg)',
        },
        /* Semantic */
        success:  'var(--color-success)',
        warning:  'var(--color-warning)',
        critical: 'var(--color-critical)',
        info:     'var(--color-info)',
        /* Mother's Touch warm palette */
        rose: {
          soft:    '#F8E8E8',
          DEFAULT: 'var(--color-rose)',
          muted:   'var(--color-rose-muted)',
        },
        sage:   { DEFAULT: '#DDEEDF', dark: '#86EFAC' },
        ivory:  '#FAF9F6',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'float':      'float 7s ease-in-out infinite',
        'fade-in':    'fade-in 0.25s ease-out',
        'slide-up':   'slide-up 0.25s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        card:   'var(--shadow-card)',
        strong: 'var(--shadow-strong)',
      },
    },
  },
  plugins: [],
}
