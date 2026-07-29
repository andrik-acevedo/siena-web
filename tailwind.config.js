/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#080B42',
          green: '#01B1AF',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-in-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
