/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#070709",
          surface: "#0d0d12",
          card: "#121218",
          border: "rgba(255, 255, 255, 0.08)",
          "border-active": "rgba(0, 255, 102, 0.4)",
        },
        acid: {
          green: "#00ff66",
          light: "#4ade80",
          dim: "rgba(0, 255, 102, 0.12)",
          glow: "rgba(0, 255, 102, 0.25)",
        },
        goa: {
          amber: "#f59e0b",
          sunset: "#fb923c",
          dim: "rgba(245, 158, 11, 0.12)",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        scanline: "scanline 3s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        scanline: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
