/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}" // Include Angular template files
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // Add DaisyUI as a plugin
};
