/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7ff",
          100: "#e9effe",
          200: "#c9d7fd",
          300: "#9eb7fb",
          400: "#6b90f7",
          500: "#3f6cf3",
          600: "#2e50d4",
          700: "#263fa8",
          800: "#223883",
          900: "#1c2b63"
        }
      },
      backgroundImage: {
        'grid': "radial-gradient(#e5e7eb 1px, transparent 1px)",
        'grid-dark': "radial-gradient(#2a2a2a 1px, transparent 1px)"
      },
      backgroundSize: {
        'grid': '20px 20px'
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.06)"
      },
      borderRadius: { '2xl': '1.25rem' },
      keyframes: {
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in .4s ease forwards'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
