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
        success: 'rgb(var(--store-success, 52 211 153) / <alpha-value>)',
        soft: 'rgb(var(--store-soft, 39 39 42) / <alpha-value>)',
        strong: 'rgb(var(--store-strong, 63 63 70) / <alpha-value>)',
        secondary: 'rgb(var(--store-secondary, 212 212 216) / <alpha-value>)',
        actionInk: 'rgb(var(--store-actionInk, 24 24 27) / <alpha-value>)',
        action: 'rgb(var(--store-action, 244 244 245) / <alpha-value>)',
        ink: 'rgb(var(--store-ink, 255 255 255) / <alpha-value>)',
        canvas: 'rgb(var(--store-canvas, 9 9 11) / <alpha-value>)',
        night: 'rgb(var(--store-night, 9 9 11) / <alpha-value>)',
        cardBg: 'rgb(var(--store-cardBg, 18 18 22) / <alpha-value>)',
        aji: 'rgb(var(--store-aji, 244 244 245) / <alpha-value>)',
        rocoto: 'rgb(var(--store-rocoto, 212 212 216) / <alpha-value>)',
        lime: 'rgb(var(--store-lime, 212 212 216) / <alpha-value>)',
        cream: 'rgb(var(--store-cream, 244 244 245) / <alpha-value>)',
        muted: 'rgb(var(--store-muted, 161 161 170) / <alpha-value>)',
        surface: 'rgb(var(--store-surface, 18 18 22) / <alpha-value>)',
        borderCream: 'rgb(var(--store-borderCream, 39 39 42) / <alpha-value>)',
        whatsapp: 'rgb(var(--store-whatsapp, 39 39 42) / <alpha-value>)'
      },
      fontFamily: {
        sora: ['Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-aji': '0 0 45px -8px rgba(0,0,0,0.35)',
        'glow-rocoto': '0 0 45px -8px rgba(0,0,0,0.35)',
        'glow-lime': '0 0 45px -8px rgba(0,0,0,0.35)',
        'glow-whatsapp': '0 0 30px -5px rgba(0,0,0,0.45)',
        'card-dark': '0 20px 40px rgba(0, 0, 0, 0.85)',
      },
      borderRadius: {
        '24': '24px',
      }
    },
  },
  plugins: [],
}
