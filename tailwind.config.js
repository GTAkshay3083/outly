/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#08080A', // Deep obsidian canvas
          900: '#121214', // Elevation card surface
          800: '#1C1C1F', // Chip / pill background
          700: '#2A2A2E', // Subtle card borders & dividers
        },
        brand: {
          accent: '#1DB954', // Electric neon highlight
          flame: '#FF5E3A',  // High-intent glow
        },
        surface: {
          primary: '#F5F5F7',
          secondary: '#A1A1A6',
          muted: '#636366',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}