/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Bricolage Grotesque Variable",
          "Inter Variable",
          "Inter",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      colors: {
        // Blueprint / ASCII-grid / isometric system — light technical theme.
        // Semantic tokens flip to light values so bg-ink/surface/panel and
        // text-line/cool/muted carry the new palette across the codebase.
        ink: "#FFFFFF", // page background (paper white)
        surface: "#FAFAFA", // section background
        panel: "#FFFFFF", // card background (white + hairline border)
        elevated: "#F4F4F5", // tinted fill / hovered cell
        line: "#0A0A0A", // ink — headings, technical strokes, outlines
        cool: "#3F3F46", // secondary text (zinc-700) — body, ≥7:1 on white
        muted: "#57575E", // metadata / mono micro labels — ≥5.5:1 on white
        grid: "#E4E4E7", // blueprint guide lines (zinc-200)
        // Single light-mode pink: crimson #C20E50 everywhere (AA as text + fill).
        "red-ink": "#C20E50",
        red: {
          300: "#C20E50",
          400: "#C20E50",
          500: "#C20E50", // signal dots
          600: "#A10F3A", // hover (darker)
          700: "#C20E50", // main accent / fills / marks
          800: "#A10F3A",
          900: "#4A0A1F",
        },
      },
      backgroundImage: {
        "gradient-energy": "linear-gradient(135deg, #FF2D75 0%, #FF1744 100%)",
        "gradient-magenta-red":
          "linear-gradient(135deg, #FF3EB5 0%, #FF1744 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
