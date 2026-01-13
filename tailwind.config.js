/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional Brand Colors
        brand: {
          'deep-blue': '#0F4C81',
          'corporate-blue': '#1A6EC1',
          'energy-orange': '#FF7A00',
          'safety-green': '#00A878',
        },
        // Professional Status Colors
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#3B82F6',
        },
        // Neutral Grays
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#121926',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      padding: {
        'safe': 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      },
      margin: {
        'safe': 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.85)',
        'glass-dark': 'rgba(15, 76, 129, 0.1)',
      },
    },
  },
  plugins: [],
}

