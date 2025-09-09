import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0f0f0f",
          900: "#0f0f0f",
          800: "#141414",
          700: "#1a1a1a",
        },
        accent: {
          pink: "#ff3ea5",
          purple: "#9b5cff",
          blue: "#00e5ff",
        }
      },
      borderRadius: {
        "2xl": "1.25rem"
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 62, 165, 0.25)"
      }
    },
  },
  plugins: [],
};
export default config;
