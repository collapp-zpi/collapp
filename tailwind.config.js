const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  // mode: 'jit',
  purge: [
    './shared/**/*.tsx',
    './layouts/**/*.tsx',
    './includes/**/*.tsx',
    './pages/**/*.tsx',
  ],
  darkMode: 'media',
  theme: {
    fontFamily: {
      sans: ['Poppins', ...defaultTheme.fontFamily.sans],
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      25: '25%',
    },
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [],
}
