/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBg: '#f8fafc',
        lightSurface: '#ffffff',
        lightCard: 'rgba(255, 255, 255, 0.85)',
        sunsetCoral: '#f43f5e',
        sunsetRose: '#e11d48',
        sunsetAmber: '#f59e0b',
        sunsetGold: '#d97706',
        neonEmerald: '#059669',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'soft-hover': '0 12px 30px -4px rgba(244, 63, 94, 0.15), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        'glow-coral': '0 4px 25px -2px rgba(244, 63, 94, 0.35)',
      },
    },
  },
  plugins: [],
}
