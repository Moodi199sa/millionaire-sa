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
        dark: '#12171F',
        // نظام التصميم الجديد — فحمي داكن + كهرماني + أخضر
        ink: {
          950: '#0D1117',
          900: '#12171F',
          850: '#161C25',
          800: '#1A212B',
          700: '#222A36',
          600: '#2E3846',
        },
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
