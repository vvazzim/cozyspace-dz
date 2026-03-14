/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F5F3EE',
          surface: '#FBFAF7',
          pearl: '#D9D9D9',
          cool: '#BFC8C9',
          ink: '#111111',
          charcoal: '#2E3236',
          muted: '#6D7278',
          gold: '#D8B96A',
          line: '#E3DDD0',
          goldsoft: '#EFE3BC'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17, 17, 17, 0.06)',
        premium: '0 18px 40px rgba(46, 50, 54, 0.16)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      letterSpacing: {
        brand: '0.12em'
      },
      backgroundImage: {
        'cozy-hero': 'linear-gradient(100deg, #F5F3EE 0%, #D9D9D9 48%, #2E3236 100%)'
      }
    }
  },
  plugins: []
};
