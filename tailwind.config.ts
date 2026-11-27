import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#172A3A", teal: "#0D9488", mist: "#F4F7F8" } } },
  plugins: []
} satisfies Config;
