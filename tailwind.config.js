/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs:  '475px',
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Legacy names kept so older class names keep working; values follow the warm palette.
        brand: {
          'deep-blue':       '#17130F',
          'primary-dark':    '#000000',
          'corporate-blue':  '#2A231C',
          'energy-orange':   '#FF6B00',
          'accent-light':    '#FF8A3D',
          'safety-green':    '#15803D',
          'green-light':     '#22A55A',
        },
        flame: { DEFAULT: '#FF6B00', deep: '#E25600', light: '#FF8A3D', soft: '#FFE9D6' },
        ink:   { DEFAULT: '#17130F', soft: '#2A231C', muted: '#6B6259', faint: '#A39789' },
        cream: { DEFAULT: '#FFF8F0', deep: '#F3E8DC' },
        line:  '#EFE7DE',
        surface: {
          bg:       '#FAF7F3',
          card:     '#FFFFFF',
          elevated: '#FFFFFF',
        },
        text: {
          primary:   '#17130F',
          secondary: '#6B6259',
          muted:     '#A39789',
        },
        border: {
          DEFAULT: '#EFE7DE',
          strong:  '#E0D4C6',
        },
        status: {
          success: '#15803D',
          warning: '#F59E0B',
          error:   '#DC2626',
          info:    '#3B82F6',
        },
        // legacy compat
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans:    ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        '5xl': '32px',
      },
      boxShadow: {
        xs:      '0 1px 3px rgba(13,17,23,0.06)',
        sm:      '0 2px 8px rgba(13,17,23,0.08)',
        DEFAULT: '0 4px 16px rgba(13,17,23,0.10)',
        md:      '0 4px 16px rgba(13,17,23,0.10)',
        lg:      '0 8px 32px rgba(13,17,23,0.12)',
        xl:      '0 16px 48px rgba(13,17,23,0.16)',
        primary: '0 10px 24px -10px rgba(23,19,15,0.45)',
        accent:  '0 6px 20px rgba(255,107,0,0.30)',
        green:   '0 6px 20px rgba(0,168,120,0.30)',
      },
      spacing: {
        'safe-top':    'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left':   'env(safe-area-inset-left, 0px)',
        'safe-right':  'env(safe-area-inset-right, 0px)',
      },
      backdropBlur: {
        glass: '24px',
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.65' },
        },
      },
      animation: {
        shimmer:      'shimmer 2.8s ease infinite',
        'slide-up':   'slide-up 0.35s ease both',
        'fade-in':    'fade-in 0.3s ease both',
        float:        'float 3.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
