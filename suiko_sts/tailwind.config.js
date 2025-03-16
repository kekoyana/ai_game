/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'chinese-pattern': "url('/chinese-pattern.svg')",
      },
    },
  },
  plugins: [],
}