import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "hsl(222 100% 97%)",
          100: "hsl(222 96% 93%)",
          200: "hsl(222 90% 85%)",
          300: "hsl(222 82% 74%)",
          400: "hsl(222 76% 61%)",
          500: "hsl(222 70% 50%)",  // primary
          600: "hsl(222 74% 42%)",
          700: "hsl(222 78% 34%)",
          800: "hsl(222 80% 26%)",
          900: "hsl(222 82% 18%)",
          950: "hsl(222 86% 11%)",
        },
        surface: {
          DEFAULT: "hsl(220 14% 8%)",
          elevated: "hsl(220 12% 12%)",
          border: "hsl(220 12% 18%)",
        },
        score: {
          high: "hsl(142 72% 50%)",
          mid: "hsl(38 92% 54%)",
          low: "hsl(0 78% 55%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
