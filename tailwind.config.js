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
        gold: '#B8860B',
        'gold-light': '#DAA520',
        'gold-pale': '#FFF8DC',
        'teal': '#1a9e6b',
        'teal-light': '#e8f7f0',
        'navy': '#0d1b3e',
        dark: '#0A0F1C',
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
