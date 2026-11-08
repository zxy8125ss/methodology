/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif'
        ],
        serif: [
          'Newsreader',
          'Merriweather',
          'Georgia',
          '"Songti SC"',
          'serif'
        ]
      },
      colors: {
        canvas: {
          base: '#FAF9F6',     // Warm paper ivory base
          subtle: '#F4F3EF',   // Subtle sidebar / section background
          card: '#FFFFFF',     // Pure white card
          overlay: '#FFFFFF',  // Elevated popover / hover
          border: '#E7E5E4',   // Stone 200 hairline subtle border
          muted: '#D6D3D1'     // Stone 300 divider
        }
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px -2px rgba(28, 25, 23, 0.04), 0 1px 3px -1px rgba(28, 25, 23, 0.02)',
        'float': '0 12px 28px -6px rgba(28, 25, 23, 0.08), 0 4px 10px -2px rgba(28, 25, 23, 0.04)',
        'dock': '0 -2px 12px 0 rgba(28, 25, 23, 0.04)'
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(6px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.97)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } }
      }
    }
  },
  plugins: []
}
