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
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        // Purple colors
        purple: {
          primary: "var(--purple-primary)",
          secondary: "var(--purple-secondary)",
          light: "var(--purple-light)",
          dark: "var(--purple-dark)",
        },
        // Pink colors
        pink: {
          primary: "var(--pink-primary)",
          secondary: "var(--pink-secondary)",
          light: "var(--pink-light)",
          dark: "var(--pink-dark)",
        },
        // Text colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        // Status colors
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
          info: "var(--status-info)",
        },
        // Border colors
        border: {
          primary: "var(--border-primary)",
          secondary: "var(--border-secondary)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
