import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {

      },
      keyframes: {
        flashGreen: {
          "0%": {
            backgroundColor: "#10B981",
          },
          "50%": {
            backgroundColor: "#34D399",
          },
        },
        flashGrey: {
          "0%": {
            backgroundColor: "#6B7280",
          },
          "50%": {
            backgroundColor: "#9CA3AF",
          },
        },
      },
      animation: {
        flashGreen: "flashGreen 1s ease-in-out",
        flashGrey: "flashGrey 1s ease-in-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
