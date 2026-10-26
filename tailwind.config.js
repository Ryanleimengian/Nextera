/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './app/lib/**/*.{js,mjs}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '2rem', lg: '3rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        navy: { DEFAULT: '#1A293A', 800: '#22364A', 900: '#132030' },
        gold: { DEFAULT: '#B69860', 300: '#D8C49A', 600: '#9C7F45', 700: '#7F6532' },
        paper: '#FAF9F6',
        sand: '#F0EDE6',
        stone: '#E6E1D7',
        ink: '#30343B',
        line: '#DED7C8',
        error: '#A23A2C',
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
        display: ['"Bodoni Moda"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        'serif-tc': ['"Noto Serif TC"', '"Songti TC"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"Noto Sans TC"', 'monospace'],
      },
      borderRadius: { DEFAULT: '2px', md: '3px', lg: '4px', xl: '6px' },
      accentColor: { navy: '#1A293A' },
    },
  },
  plugins: [],
};
