/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: [
          'Newsreader',
          'Charter',
          'Georgia',
          '"Source Serif Pro"',
          '"Songti SC"',
          'serif'
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Inter',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          'system-ui',
          'sans-serif'
        ]
      },
      colors: {
        claude: {
          50: '#FBF8F5',
          100: '#F7EFE9',
          200: '#F0DED3',
          300: '#E4C2B0',
          400: '#D79E84',
          500: '#CC785C', // Anthropic Signature Terracotta
          600: '#B8684D',
          700: '#9E543C',
          800: '#824430',
          900: '#6B3827'
        },
        paper: {
          base: '#FAF9F5',     // Claude warm ivory page canvas
          subtle: '#F4F2EC',   // Claude warm container background
          card: '#FFFFFF',     // Pure card white
          border: '#EAE6DF',   // Claude hairline warm border
          borderStrong: '#DCD7CE',
          muted: '#8C877D',    // Subtle text
          charcoal: '#1F1E1B', // Deep warm ink black
          ink: '#3D3A34'       // Warm body text
        }
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgba(31, 30, 27, 0.03)',
        'card': '0 1px 3px 0 rgba(31, 30, 27, 0.04), 0 1px 2px -1px rgba(31, 30, 27, 0.02)',
        'float': '0 10px 25px -4px rgba(31, 30, 27, 0.06), 0 4px 10px -2px rgba(31, 30, 27, 0.03)',
        'dock': '0 -1px 4px 0 rgba(31, 30, 27, 0.04)'
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
