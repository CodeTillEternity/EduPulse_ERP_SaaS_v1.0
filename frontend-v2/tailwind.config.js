/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          bg: '#0A0A0A',
          surface: '#111111',
          card: '#141414',
          'card-hover': '#1A1A1A',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.18)',
          muted: '#8E8E93',
          subtle: '#48484A',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        'color-primary': 'var(--color-primary)',
        'color-secondary': 'var(--color-secondary)',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        'glow-subtle': '0 0 30px -5px rgba(99, 102, 241, 0.15)',
        'glow-card': '0 0 50px -10px rgba(99, 102, 241, 0.22)',
        'glow-cyan': '0 0 50px -10px rgba(6, 182, 212, 0.22)',
        'glow-purple': '0 0 50px -10px rgba(168, 85, 247, 0.22)',
        'glow-amber': '0 0 50px -10px rgba(245, 158, 11, 0.22)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(10, 10, 10, 0) 70%)',
        'mesh-card': 'radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 60%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'glass-card': 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.005) 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.125rem' }],
        'base': ['0.875rem', { lineHeight: '1.25rem' }],
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.125rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
        '4xl': ['2rem', { lineHeight: '2.375rem' }],
        '5xl': ['2.75rem', { lineHeight: '3rem' }],
        '6xl': ['3.5rem', { lineHeight: '3.75rem' }],
        '7xl': ['4.5rem', { lineHeight: '4.75rem' }],
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
