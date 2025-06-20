/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Use the NEW package here, as instructed by the error message
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

export default config