/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
      colors: {
        wedding: {
          cream: '#f9f5f2',
          blush: '#f2e4e1',
          rose: '#c9958a',
          gold: '#b8956a',
          charcoal: '#3d3d3d',
          muted: '#7a6f6a',
        },
      },
      boxShadow: {
        soft: '0 4px 24px rgba(61, 61, 61, 0.08)',
        card: '0 2px 12px rgba(184, 149, 106, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
