/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
  
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
        },
        boxShadow: {
          // Add custom shadow using CSS variable for dynamic theming
          DEFAULT: '0 2px 4px var(--shadow-color)',
          md: '0 3px 6px var(--shadow-color)',
          lg: '0 4px 6px var(--shadow-color)',
          xl: '0 10px 15px var(--shadow-color)',
          '2xl': '0 15px 30px var(--shadow-color)',
        },
        keyframes: {
          floatFromBottom: {
            '0%': { transform: 'translateY(100%)', opacity: 1 },
            '100%': { transform: 'translateY(-100%)', opacity: 0 },
          },
          fadeOut: {
            '0%': { opacity: 1 },
            '100%': { opacity: 0 },
          },
        },
        animation: {
          'float-from-bottom': 'floatFromBottom 2s ease-in-out',
          'fade-out': 'fadeOut 2s ease-out forwards',
        },
      },
    },
    plugins: [],
  }