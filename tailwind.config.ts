import type { Config } from "tailwindcss";

// Charte couleur du brief — base neutre (bleu nuit + gris) + accent orange réservé prix/CTA.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0F2A43", dark: "#0B2034" }, // bleu nuit / header
        accent: { DEFAULT: "#F97316", hover: "#EA670C" }, // orange — prix & actions
        page: "#F4F5F7",
        line: "#E5E7EB",
        ink: "#16202B",
        promo: "#DC2626",
        stock: "#16A34A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
