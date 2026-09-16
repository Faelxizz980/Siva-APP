/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'jet-black': '#092327',
        'slate-deep': '#0B5351',
        'sea-green': '#00A9A5',
        'air-blue': '#4E8098',
        'sky-blue': '#90C2E7',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
}
