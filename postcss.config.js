// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // ← Correct for Tailwind v4+
    autoprefixer: {},
  },
};