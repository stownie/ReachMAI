/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ReachMAI Brand Colors - Gold, Maroon, Cream
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        secondary: {
          50: '#fef7f7',
          100: '#feeaea',
          200: '#fdd4d4',
          300: '#fbb1b1',
          400: '#f78585',
          500: '#b8312f',
          600: '#a02826',
          700: '#800020',
          800: '#6b1c1a',
          900: '#4a1413',
        },
        accent: {
          50: '#fffef8',
          100: '#fffbf0',
          200: '#fef7e0',
          300: '#fef0c7',
          400: '#fde6a4',
          500: '#f7f3e9',
          600: '#f0e8d1',
          700: '#e6d7b8',
          800: '#d4c299',
          900: '#b8a076',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        'brand': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(245, 158, 11, 0.1), 0 2px 4px -1px rgba(245, 158, 11, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)',
      }
    },
  },
  plugins: [],
}