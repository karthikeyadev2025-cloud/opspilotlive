/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — vivid blue (Linear/Notion style)
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // main
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Neutral — true grey (not blue-grey)
        neutral: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Dark surface for hero/auth dark sections
        dark: {
          50:  '#1a2235',
          100: '#141c2e',
          200: '#0f1627',
          300: '#0a1020',
          400: '#070c18',
          500: '#050810',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'xs':       '0 1px 2px rgba(0,0,0,0.05)',
        'sm':       '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'md':       '0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'card':     '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
        'card-lg':  '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.06)',
        'modal':    '0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08)',
        'blue':     '0 4px 20px rgba(37,99,235,0.30)',
        'blue-lg':  '0 6px 32px rgba(37,99,235,0.40)',
        'glow':     '0 0 40px rgba(37,99,235,0.15)',
      },
    },
  },
  plugins: [],
};
