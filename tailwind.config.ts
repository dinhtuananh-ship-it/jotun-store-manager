/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jotun: {
          50: '#eef6ff', 100: '#d9ebff', 200: '#b0d4ff', 300: '#7fb5ff',
          400: '#4d8dff', 500: '#1a5fd7', 600: '#154dab', 700: '#123d88',
          800: '#0f2f66', 900: '#0b2147'
        },
        brand: { yellow: '#FFC72C', blue: '#003DA5', red: '#E30613' }
      },
      boxShadow: { glow: '0 0 40px -10px rgba(26,95,215,.5)', card: '0 10px 40px -12px rgba(11,33,71,.25)' },
      animation: { float: 'float 6s ease-in-out infinite', shimmer: 'shimmer 2.5s linear infinite' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } }
      }
    }
  },
  plugins: []
};
