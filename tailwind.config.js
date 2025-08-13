/********************
 Tailwind Config
********************/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0f1115',
          card: '#1a1f2b',
          muted: '#98a2b3',
          accent: '#0ea5e9'
        }
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(2, 6, 23, 0.5)'
      }
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}; 