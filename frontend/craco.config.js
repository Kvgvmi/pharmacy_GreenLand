// craco.config.js
const path = require('path');
const webpack = require('webpack'); // Add this line

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "stream": require.resolve("stream-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process/browser")
      };

      // Ensure that buffer and process are also polyfilled if needed
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ];

      return webpackConfig;
    }
  }
};
