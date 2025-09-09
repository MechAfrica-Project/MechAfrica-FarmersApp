/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary-green": "#00594C",
        "accent-yellow": "#FCFF3B",
        "light-yellow": "#FDFFE0",
        "light-gray": "#E5E7EB",
        "medium-gray": "#6B7280",
      },
      fontFamily:{
        mulish:["Mulish","sans-serif"]
      }
    },
  },
  plugins: [],
};
