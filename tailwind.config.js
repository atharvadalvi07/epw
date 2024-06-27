/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // "./node_modules/flowbite-react/**/*.js",
  ],
  // xs, extra-small: 0px
  // sm, small: 600px
  // md, medium: 900px
  // lg, large: 1024px
  // xl, extra-large: 1536px
  theme: {
    fontSize: {
      xs: ["12px", "16px"],
      sm: ["14px", "20px"],
      base: ["15px", "24px"],
      lg: ["20px", "32px"],
      xl: ["24px", "32px"],
      "2xl": ["32px", "40px"],
      xxl: ["40px", "48px"],
      "3xl": ["48px", "48px"],
    },
    screens: {
      xs: "0px",
      sm: "600px",
      // => @media (min-width: 640px) { ... }

      md: "900px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      // 'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      xl: "1536px",
      // => @media (min-width: 1536px) { ... }
      "2xl": "1900px",
      // => @media (min-width: 1900px) { ... }
    },
    extend: {
      colors: {
        "primary-green": "#699958",
        "primary-off-white": "#F4F4F4",
        "primary-broken-white": "#EFEFEF",
        "primary-faded-text": "#6F767E",
        "regal-blue": "#243c5a",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  // plugins: [require("flowbite/plugin")],
};
