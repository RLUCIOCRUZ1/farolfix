import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0A84FF",
          dark: "#05070D",
          light: "#F4F8FF"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(10, 132, 255, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
