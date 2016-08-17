'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> Brightcove  */\n',

    /* Build Stuff */
    clean: {
      files: ['tmp', 'dist']
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      }
    },
    browserify: {
      dist: {
        files: {
          'tmp/videojs5-dashjs-p2p-source-handler.js': ['src/js/videojs-dash.js']
        },
        options: {
          transform: [
            ['babelify', {
              loose: 'all'
            }],
            'browserify-shim'
          ]
        }
      },
      watch: {
        files: {
          'dist/videojs5-dashjs-p2p-source-handler.debug.js': ['src/js/videojs-dash.js']
        },
        options: {
          transform: [
            ['babelify', {
              loose: 'all'
            }],
            'browserify-shim'
          ],
          browserifyOptions: {
              debug: true
          },
          watch: true,
          keepAlive: true
        }
      }
    },
    babel: {
      dist: {
        files: [{
          expand: true,
          src: ['src/js/*.js'],
          dest: 'es5',
          ext: '.js'
        }],
        options: {
          presets: ['es2015']
        }
      }
    },
    shell: {
        uglifyjs: {
            command: 'node_modules/uglifyjs/bin/uglifyjs tmp/videojs5-dashjs-p2p-source-handler.js > tmp/videojs5-dashjs-p2p-source-handler.min.js',
        }
    },
    concat: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: [
          'tmp/videojs5-dashjs-p2p-source-handler.js'
        ],
        dest: 'dist/videojs5-dashjs-p2p-source-handler.js'
      }
    },
    karma: {
      test: {
        options: {
          configFile: 'test/karma.config.js'
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('test', 'karma');
  grunt.registerTask('build', ['clean', 'jshint', 'browserify:dist', 'babel:dist', 'shell:uglifyjs', 'concat']);
  grunt.registerTask('default', ['build', 'test']);
  grunt.registerTask('watch', ['browserify:watch']);
};
