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
        // Background colors
        bg: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--bg-tertiary) / <alpha-value>)",
        },
        // Purple colors
        purple: {
          primary: "rgb(var(--purple-primary) / <alpha-value>)",
          secondary: "rgb(var(--purple-secondary) / <alpha-value>)",
          light: "rgb(var(--purple-light) / <alpha-value>)",
          dark: "rgb(var(--purple-dark) / <alpha-value>)",
        },
        // Pink colors
        pink: {
          primary: "rgb(var(--pink-primary) / <alpha-value>)",
          secondary: "rgb(var(--pink-secondary) / <alpha-value>)",
          light: "rgb(var(--pink-light) / <alpha-value>)",
          dark: "rgb(var(--pink-dark) / <alpha-value>)",
        },
        // Text colors
        text: {
          // Keep text WHITE only; use fixed opacity for hierarchy
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-primary) / 0.82)",
          muted: "rgb(var(--text-primary) / 0.62)",
        },
        // Status colors
        status: {
          success: "rgb(var(--status-success) / <alpha-value>)",
          warning: "rgb(var(--status-warning) / <alpha-value>)",
          error: "rgb(var(--status-error) / <alpha-value>)",
          info: "rgb(var(--status-info) / <alpha-value>)",
        },
        // Border colors
        border: {
          primary: "rgb(var(--border-primary) / <alpha-value>)",
          secondary: "rgb(var(--border-secondary) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
