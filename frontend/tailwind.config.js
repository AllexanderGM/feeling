import { heroui } from '@heroui/theme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'bebas-neue': ['Bebas Neue', 'sans-serif'],
        secondary: ['Arial', 'sans-serif']
      },
      colors: {
        // Colores de feeling
        feeling: {
          rouse: '#ff0062',
          spirit: '#fcb87a',
          gray: '#808080',
          dark: '#171717',
          purple: '#7D4EFF'
        },
        // Colores base para el tema oscuro
        background: {
          DEFAULT: '#171717',
          secondary: '#202020',
          tertiary: '#2a2a2a'
        },
        // Colores primarios (ROUSE)
        primary: {
          DEFAULT: '#ff0062',
          50: '#fff1f6',
          100: '#ffe4ed',
          200: '#ffc9db',
          300: '#ff9dbb',
          400: '#ff5a8a',
          500: '#ff0062',
          600: '#eb0055',
          700: '#d10046',
          800: '#a8003b',
          900: '#8c0033',
          950: '#57001c'
        },
        // Colores secundarios (SPIRIT)
        secondary: {
          DEFAULT: '#fcb87a',
          50: '#fff9ed',
          100: '#fff1d3',
          200: '#fee0a7',
          300: '#fcb87a',
          400: '#fa9e4c',
          500: '#f67921',
          600: '#e85f17',
          700: '#c04615',
          800: '#993818',
          900: '#7d2f17',
          950: '#431508'
        }
      },
      // Gradientes predefinidos
      backgroundImage: {
        'rouse-gradient': 'linear-gradient(to right, #FF0062, #7D4EFF)',
        'spirit-gradient': 'linear-gradient(to right, #FCB87A, #7D4EFF)'
      }
    }
  },
  darkMode: 'class',
  plugins: [heroui()]
}
