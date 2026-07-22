// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},    // Handles `@import` rules
    'tailwindcss/nesting': {}, // Optional: if you are using nesting
    tailwindcss: {},          // Tailwind should come after import
    autoprefixer: {},         // Add vendor prefixes
    'postcss-apply': {},      // Process `@apply` directives
  },
};
// module.exports = {
//   plugins: {
//     'postcss-import': {},
//     tailwindcss: {},
//     autoprefixer: {},
//   },
// };


  