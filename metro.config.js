const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration pour GitHub Pages
if (process.env.GITHUB_PAGES) {
  config.transformer = {
    ...config.transformer,
    publicPath: '/KIDS_EXPO/'
  };
}

module.exports = config;