import { resolve } from "node:path";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    resolve(__dirname, "./**/*.rs"),
    resolve(__dirname, "./src/**/*.{js,ts,jsx,tsx,html,astro}"),
    resolve(__dirname, "./node_modules/flowbite-react/**/*.{cjs,js}"),
  ],
  theme: {
    extend: {
      screens: {
        xs: "500px",
      },
      colors: {
        primary: "#7f5af0",
        primaryHover: "#6546c3",
        secondary: "#72757e",
        secondaryHover: "#52545c",
      },
    },
  },
  plugins: [],
};
