/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#EFEBE3',
        ink: {
          DEFAULT: '#0F1A14',
          muted: '#4A5B52',
          subtle: '#7A8C83',
        },
        primary: {
          DEFAULT: '#1F5A3D',
          dark: '#133927',
          light: '#2B7A53',
          surface: '#EBF4F0',
        },
        lime: {
          DEFAULT: '#C8F23B',
          hover: '#B5DC32',
          light: '#E6F9A2',
        },
        lilac: {
          DEFAULT: '#C9B6F2',
          light: '#ECE5FA',
        },
        teal: {
          DEFAULT: '#7CCFC4',
          light: '#D3F1ED',
        },
        amber: {
          DEFAULT: '#F4B740',
          light: '#FDF0D5',
        },
        red: {
          DEFAULT: '#D9534F',
          light: '#F9DCDA',
        },
        surface: {
          dark: '#0A110D',
          card: '#122019',
          darkcard: '#122019',
          darkcardhover: '#182C22',
          border: '#1F372B',
          darkborder: '#1F372B',
          glass: 'rgba(255, 255, 255, 0.7)',
          glassDark: 'rgba(18, 32, 25, 0.75)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Manrope', 'Noto Sans Devanagari', 'sans-serif'],
        heading: ['Manrope', 'Plus Jakarta Sans', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'liquid': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-lime': '0 0 25px -5px rgba(200, 242, 59, 0.35)',
        'glow-primary': '0 0 25px -5px rgba(31, 90, 61, 0.45)',
        'card-soft': '0 10px 30px -10px rgba(15, 26, 20, 0.08)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
