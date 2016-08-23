module.exports = function(config) {
  config.set({
    basePath: '..',

    files: [
      'node_modules/video.js/dist/video-js.css',
      'node_modules/video.js/dist/video.js',
      'node_modules/dashjs/dist/dash.all.debug.js',
      'dist/videojs5-dashjs-p2p-source-handler.js',
      'test/integration.test.js',
      'test/globals.test.js',
      'test/dashjs.test.js'
    ],

    frameworks: ['qunit'],

    singleRun: true,

    browserDisconnectTolerance: 0,

    captureTimeout: 15000,

    browserNoActivityTimeout: 15000,

    browsers: process.env.TRAVIS ? ['travisChrome'] : ['Chrome', 'Firefox'],

    customLaunchers: {
      travisChrome: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  });
};
