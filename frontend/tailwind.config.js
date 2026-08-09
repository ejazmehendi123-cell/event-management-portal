/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1F3B',
        gold: '#E8A33D',
        paper: '#F7F5F0',
        teal: '#2F6F6B',
        clay: '#C1553D',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ticket-stub':
          'radial-gradient(circle at 0 50%, transparent 8px, var(--tw-gradient-stops)) ',
      },
    },
  },
  plugins: [],
};
