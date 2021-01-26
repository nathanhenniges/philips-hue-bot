module.exports = {
  purge: ['./views/**/*.ejs'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#f2f5fd',
          200: '#97afed',
          300: '#3866dc',
          400: '#193b8f',
          500: '#091534',
          600: '#081430',
          700: '#081430',
          800: '#08122b',
          900: '#08122b',
        },
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
