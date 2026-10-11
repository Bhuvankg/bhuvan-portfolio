/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#07080D',
          secondary: '#10121A',
          card: 'rgba(16, 18, 26, 0.7)',
          hover: 'rgba(24, 27, 39, 0.85)',
        },
        accent: {
          blue: '#5B8CFF',
          violet: '#9B6BFF',
          cyan: '#38EF7D',
        },
        text: {
          main: '#F5F7FF',
          muted: '#9298AB',
          subtle: '#62687F',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #5B8CFF 0%, #9B6BFF 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 50%, rgba(91, 140, 255, 0.15) 0%, rgba(155, 107, 255, 0.05) 50%, transparent 80%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
