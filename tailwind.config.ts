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
          bg: "#0d0d0d",
          green: "#00ff41",
          "green-dim": "#00a82a",
          amber: "#ffb000",
          text: "#c8c8c8",
          dim: "#555555",
          error: "#ff4444",
          highlight: "#1a3a1a",
          border: "#1e1e1e",
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
