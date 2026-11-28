import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102B38",
        teal: "#167F73",
        mist: "#F3F6F8",
        seafoam: "#7BDFC5"
      },
      boxShadow: {
        soft: "0 16px 42px rgba(16, 43, 56, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
