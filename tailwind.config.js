/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primaire kleuren van Striks
        'striksMarine': '#1A2B50', // Striks Marineblauw
        'striksRose': '#C64B8C',   // Menselijk Magenta
        'striksTurquoise': '#3BC5C9', // AI Turquoise
        
        // Secundaire kleuren
        'striksOrange': '#F27052', // Zonsopgang Oranje
        'striksGold': '#F9B854',   // Gouden Inzicht
        'striksPurple': '#8A4E85', // Diep Paars
        'striksBlue': '#4B99D2',   // Oceaan Blauw
        
        // Achtergrondkleuren
        'striksLight': '#F7F9FC',  // Lichtgrijs
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'merriweather': ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
} 