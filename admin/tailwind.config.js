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
        canvas: '#09090b',
        night: '#09090b',
        cardBg: '#121216',
        surface: '#121216',
        borderCream: '#27272a',
        cream: '#f4f4f5',
        muted: '#a1a1aa',
        aji: '#f4f4f5',
        rocoto: '#d4d4d8',
        lime: '#d4d4d8',
        whatsapp: '#27272a',
        // Compatibilidad con componentes administrativos
        admin: {
          bg: '#09090b',
          surface: '#121216',
          card: '#121216',
          muted: '#18181b',
          border: 'rgba(244, 244, 245, 0.1)',
          hover: 'rgba(244, 244, 245, 0.05)',
        },
        brand: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a', // Ají Amarillo como acento primario
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        accent: {
          emerald: '#34d399', // Disponible (Lima)
          rose: '#d4d4d8',    // Agotado (Rocoto)
          amber: '#f4f4f5',   // Advertencia (Ají)
          blue: '#a1a1aa',
          cyan: '#a1a1aa',
        }
      },
      fontFamily: {
        sora: ['Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-aji': '0 0 35px -8px rgba(0,0,0,0.35)',
        'glow-rocoto': '0 0 35px -8px rgba(0,0,0,0.35)',
        'glow-lime': '0 0 35px -8px rgba(0,0,0,0.35)',
        'card-dark': '0 20px 40px rgba(0, 0, 0, 0.85)',
        'admin-card': '0 4px 20px rgba(0, 0, 0, 0.6)',
        'admin-modal': '0 25px 60px rgba(0, 0, 0, 0.95)',
        'admin-glow': '0 0 25px -4px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        '16': '16px',
        '20': '20px',
        '24': '24px',
        'admin': '16px',
      },
    },
  },
  plugins: [],
}
