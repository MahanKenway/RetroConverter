/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)', // navy blue
          foreground: 'var(--color-primary-foreground)' // white
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // silver
          foreground: 'var(--color-secondary-foreground)' // black
        },
        accent: {
          DEFAULT: 'var(--color-accent)', // blue
          foreground: 'var(--color-accent-foreground)' // white
        },
        background: 'var(--color-background)', // teal
        foreground: 'var(--color-foreground)', // white
        card: {
          DEFAULT: 'var(--color-card)', // silver
          foreground: 'var(--color-card-foreground)' // black
        },
        popover: {
          DEFAULT: 'var(--color-popover)', // silver
          foreground: 'var(--color-popover-foreground)' // black
        },
        muted: {
          DEFAULT: 'var(--color-muted)', // gray
          foreground: 'var(--color-muted-foreground)' // black
        },
        border: 'var(--color-border)', // gray
        input: 'var(--color-input)', // white
        ring: 'var(--color-ring)', // navy blue
        success: {
          DEFAULT: 'var(--color-success)', // green
          foreground: 'var(--color-success-foreground)' // white
        },
        warning: {
          DEFAULT: 'var(--color-warning)', // yellow
          foreground: 'var(--color-warning-foreground)' // black
        },
        error: {
          DEFAULT: 'var(--color-error)', // red
          foreground: 'var(--color-error-foreground)' // white
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', // red
          foreground: 'var(--color-destructive-foreground)' // white
        }
      },
      fontFamily: {
        sans: ['"MS Sans Serif"', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
        small: ['"Small Fonts"', '"MS Sans Serif"', 'monospace']
      },
      fontSize: {
        'xs': ['8px', { lineHeight: '1.1' }],
        'sm': ['10px', { lineHeight: '1.5' }],
        'base': ['11px', { lineHeight: '1.2' }],
        'lg': ['12px', { lineHeight: '1.3' }],
        'xl': ['14px', { lineHeight: '1.25' }],
        '2xl': ['16px', { lineHeight: '1.2' }]
      },
      spacing: {
        '98-xs': '2px',
        '98-sm': '4px',
        '98-md': '8px',
        '98-lg': '16px'
      },
      borderRadius: {
        'none': '0px'
      },
      boxShadow: {
        'win98-raised': 'inset -1px -1px 0 var(--color-shadow), inset 1px 1px 0 var(--color-highlight)',
        'win98-pressed': 'inset 1px 1px 0 var(--color-shadow), inset -1px -1px 0 var(--color-highlight)',
        'win98-window': '2px 2px 0 rgba(0, 0, 0, 0.2)'
      },
      zIndex: {
        'desktop': '0',
        'window': '10',
        'active-window': '100',
        'taskbar': '200',
        'modal': '300'
      }
    }
  },
  plugins: []
}
