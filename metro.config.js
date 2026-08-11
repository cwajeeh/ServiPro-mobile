const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;

module.exports = mergeConfig(getDefaultConfig(projectRoot), {
  projectRoot,
  watchFolders: [projectRoot],
  resolver: {
    extraNodeModules: {
      '@': path.resolve(projectRoot, 'src'),
    },
  },
});
