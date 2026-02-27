/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        porcelain: '#FDFBF7',
        navy: {
          DEFAULT: '#1A2D63',
          hover: '#2A4488',
        },
        'slate-blue': '#475D8F',
        'glow-blue': '#B8C5E6',
        'muted-blue': '#7B8DB5',
      },
      fontFamily: {
        general: ['Satoshi', 'system-ui', 'sans-serif'],
        newsreader: ['Newsreader', 'Georgia', 'serif'],
        instrument: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'scroll-logos': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUpScroll: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'thinking-dot': {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'waveform-bounce': {
          '0%': { transform: 'scaleY(0.6)' },
          '100%': { transform: 'scaleY(1.3)' },
        },
        'wavePulse': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.5)' },
        },
        'progress-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'scroll-logos': 'scroll-logos 30s linear infinite',
        'fade-in-up-scroll': 'fadeInUpScroll 0.6s ease-out forwards',
        'blink': 'blink 0.8s ease-in-out infinite',
        'thinking-dot-1': 'thinking-dot 1.4s ease-in-out infinite',
        'thinking-dot-2': 'thinking-dot 1.4s ease-in-out 0.2s infinite',
        'thinking-dot-3': 'thinking-dot 1.4s ease-in-out 0.4s infinite',
        'progress-bar': 'progress-bar 2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
