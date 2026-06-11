import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", '[data-theme="uninetdark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        lift: "0 2px 4px rgba(0,0,0,0.05), 0 16px 40px rgba(0,0,0,0.10)",
        modal: "0 24px 80px rgba(0,0,0,0.28)",
      },
      borderRadius: { apple: "1.25rem" },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        uninet: {
          primary: "#0071e3", "primary-content": "#ffffff",
          secondary: "#5e5ce6", accent: "#0071e3",
          neutral: "#1d1d1f",
          "base-100": "#ffffff", "base-200": "#f5f5f7", "base-300": "#e8e8ed",
          "base-content": "#1d1d1f",
          info: "#0071e3", success: "#34c759", warning: "#ff9500", error: "#ff3b30",
          "--rounded-btn": "980px", "--rounded-box": "1.25rem", "--rounded-badge": "980px",
          "--btn-focus-scale": "0.97", "--animation-btn": "0.2s",
        },
      },
      {
        uninetdark: {
          primary: "#0a84ff", "primary-content": "#ffffff",
          secondary: "#5e5ce6", accent: "#0a84ff",
          neutral: "#e6e6e6",
          "base-100": "#1c1c1e", "base-200": "#000000", "base-300": "#2c2c2e",
          "base-content": "#f5f5f7",
          info: "#0a84ff", success: "#30d158", warning: "#ff9f0a", error: "#ff453a",
          "--rounded-btn": "980px", "--rounded-box": "1.25rem", "--rounded-badge": "980px",
          "--btn-focus-scale": "0.97", "--animation-btn": "0.2s",
        },
      },
    ],
  },
};
