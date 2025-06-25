import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        graphik: ["Graphik", ...fontFamily.sans],
      },
      colors: {
        primary: "#F94D27",
        "text-color": "#3D3D3D",
        "light-text-color": "#8F95B2",
        "placeholder-text": "#6F6D66",
        "alternate-black-text-color": "#B2B1AA"
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
