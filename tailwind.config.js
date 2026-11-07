/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4A017',
        'gold-light': '#F5C842',
        'gold-pale': '#FDF6DC',
        dark: '#0A0F1C',
        // الهوية الفاتحة الفخمة — عاجي دافئ + ذهبي
        cream: '#F6F0E3',
        'cream-card': '#FFFCF5',
        ink: '#3A2E1A',
        'ink-soft': '#5C4A2C',
        'ink-muted': '#86744F',
        'gold-deep': '#9C7410',
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
