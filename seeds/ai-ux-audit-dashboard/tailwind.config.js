/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#F8FAFC',
        surface: '#FFFFFF',
        muted: '#F1F5F9',
        primary: '#0F172A',
        secondary: '#334155',
        accent: '#1D4ED8',
        'accent-hover': '#1E40AF',
        border: '#CBD5E1',
      },
      borderRadius: {
        card: '10px',
        control: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
