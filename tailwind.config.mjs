/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F3EFE7',
          surface: '#FCFBF8',
          pearl: '#E6E0D4',
          cool: '#C7CFD0',
          ink: '#111111',
          charcoal: '#2E3236',
          muted: '#5F666D',
          gold: '#D8B96A',
          line: '#DDD3C3',
          goldsoft: '#F2E8C7'
        }
      },
      boxShadow: {
        soft: '0 14px 34px rgba(46, 50, 54, 0.08), 0 2px 10px rgba(17, 17, 17, 0.04)',
        premium: '0 24px 60px rgba(46, 50, 54, 0.18), 0 6px 18px rgba(17, 17, 17, 0.08)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      letterSpacing: {
        brand: '0.12em'
      },
      backgroundImage: {
        'cozy-hero': 'linear-gradient(0deg, #b6c6c6 0%, #b6c6c6 100%)'
      }
    }
  },
  plugins: []
};
