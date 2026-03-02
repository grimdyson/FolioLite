import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      tablet: "768px",
      laptop: "1280px",
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        10: "0.625rem",
        12: "0.75rem",
        16: "1rem",
        40: "2.5rem",
        80: "5rem",
      },
      lineHeight: {
        none: "1",
        tight: "1.4",
        relaxed: "1.75",
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
      },
      borderRadius: {
        base: "var(--radius)",
      },
      boxShadow: {
        soft: "0 10px 30px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
