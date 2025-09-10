// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // ← MUST include .jsx
  ],
  theme: {
    extend: {
      colors: {
        'peachpuff-100': '#FFE5B4',
        'lavender-50': '#E6E6FA',
        'sky-50': '#E0F6FF',
        'coral-400': '#FF9A9E',
        'pink-500': '#FECFEF',
        'gold-500': '#FFD700',
        'mint-400': '#A0E6C7',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}