/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ReachMAI Brand Colors - Using default Tailwind colors
        // primary = yellow (gold-like), secondary = red (maroon-like)
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      },
      fontFamily: {
        'brand': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(234, 179, 8, 0.1), 0 2px 4px -1px rgba(234, 179, 8, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(234, 179, 8, 0.1), 0 4px 6px -2px rgba(234, 179, 8, 0.05)',
      }
    },
  },
  plugins: [],
}