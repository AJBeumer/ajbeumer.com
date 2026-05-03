import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["IBM Plex Mono", "Courier New", "Courier", "monospace"],
      },
      colors: {
        dos: {
          bg: "var(--dos-bg)",
          green: "var(--dos-green)",
          "green-dim": "var(--dos-green-dim)",
          amber: "var(--dos-amber)",
          text: "var(--dos-text)",
          dim: "var(--dos-dim)",
          error: "var(--dos-error)",
          highlight: "var(--dos-highlight)",
          border: "var(--dos-border)",
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-in": "fadeIn 0.3s ease-in",
        "matrix-fall": "matrixFall 0.05s linear",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
