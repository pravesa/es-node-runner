// Test config
/**
 * @type {import('./src/config').Config}
 */
module.exports = {
  buildOptions: {
    entry: 'test/example/src/index.ts',
  },
  watchOptions: {
    watch: ['test/example/src'],
  },
};
