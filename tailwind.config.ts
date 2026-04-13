import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0f0ff",
          100: "#e0e0ff",
          200: "#c4c4ff",
          300: "#a0a0ff",
          400: "#7b7bff",
          500: "#5854f5",
          600: "#4340e8",
          700: "#3530cc",
          800: "#2b28a3",
          900: "#252481",
          950: "#16154d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
