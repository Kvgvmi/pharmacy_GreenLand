const path = require("path");
const webpack = require("webpack");

module.exports = {
  // Entry point for your project
  entry: "./src/index.js", // or your entry file

  // Output configuration
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },

  // Module rules and other configurations
  module: {
    rules: [
      // Your module rules here
    ],
  },

  // Resolve configurations to include polyfills
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      zlib: require.resolve("browserify-zlib"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      util: require.resolve("util/"),
      zlib: require.resolve("browserify-zlib"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert/"),
      url: require.resolve("url/"),
    },
  },

  // Plugins
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
