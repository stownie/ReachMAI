/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ReachMAI Brand Colors - Musical Arts Institute Theme
        primary: {
          50: 'rgb(254 252 232 / <alpha-value>)',   // yellow-50
          100: 'rgb(254 249 195 / <alpha-value>)',  // yellow-100
          200: 'rgb(254 240 138 / <alpha-value>)',  // yellow-200
          300: 'rgb(253 224 71 / <alpha-value>)',   // yellow-300
          400: 'rgb(250 204 21 / <alpha-value>)',   // yellow-400
          500: 'rgb(234 179 8 / <alpha-value>)',    // yellow-500
          600: 'rgb(202 138 4 / <alpha-value>)',    // yellow-600 (rich gold)
          700: 'rgb(161 98 7 / <alpha-value>)',     // yellow-700
          800: 'rgb(133 77 14 / <alpha-value>)',    // yellow-800
          900: 'rgb(113 63 18 / <alpha-value>)',    // yellow-900
          DEFAULT: 'rgb(202 138 4 / <alpha-value>)', // primary-600
        },
        secondary: {
          50: 'rgb(254 242 242 / <alpha-value>)',   // red-50
          100: 'rgb(254 226 226 / <alpha-value>)',  // red-100
          200: 'rgb(254 202 202 / <alpha-value>)',  // red-200
          300: 'rgb(252 165 165 / <alpha-value>)',  // red-300
          400: 'rgb(248 113 113 / <alpha-value>)',  // red-400
          500: 'rgb(239 68 68 / <alpha-value>)',    // red-500
          600: 'rgb(220 38 38 / <alpha-value>)',    // red-600
          700: 'rgb(185 28 28 / <alpha-value>)',    // red-700
          800: 'rgb(153 27 27 / <alpha-value>)',    // red-800 (deep maroon)
          900: 'rgb(127 29 29 / <alpha-value>)',    // red-900
          DEFAULT: 'rgb(153 27 27 / <alpha-value>)', // secondary-800
        },
        accent: {
          50: 'rgb(254 252 232 / <alpha-value>)',   // yellow-50 (warm cream)
          100: 'rgb(254 249 195 / <alpha-value>)',  // yellow-100
          200: 'rgb(254 240 138 / <alpha-value>)',  // yellow-200
          DEFAULT: 'rgb(254 252 232 / <alpha-value>)', // accent-50
        },
      },
      fontFamily: {
        'brand': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(202, 138, 4, 0.15), 0 2px 4px -1px rgba(202, 138, 4, 0.1)',
        'brand-lg': '0 10px 15px -3px rgba(202, 138, 4, 0.15), 0 4px 6px -2px rgba(202, 138, 4, 0.1)',
      }
    },
  },
  plugins: [],
}