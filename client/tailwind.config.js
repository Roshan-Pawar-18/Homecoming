/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a6b4a",
          light: "#22c55e",
          dark: "#14532d",
        },
        amber: { badge: "#f59e0b" },
      },
    },
  },
  plugins: [],
}