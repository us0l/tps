/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#121212',
          800: '#1f1f1f',
          700: '#2d2d2d',
          600: '#404040',
        }
      },
      aspectRatio: {
        '16/7': '16 / 7',
      },
      screens: {
        'xs': '475px',
        mobile: {max: "767px"}
      },
      spacing: {
        'safe-area-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [
   
  ],
}