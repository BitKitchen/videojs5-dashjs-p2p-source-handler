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
          'tmp/videojs-dash.js': ['src/js/videojs-dash.js']
        },
        options: {
          transform: [
            ['babelify', {
              loose: 'all'
            }],
            'browserify-shim'
          ]
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
            command: 'node_modules/uglifyjs/bin/uglifyjs tmp/videojs-dash.js > tmp/videojs-dash.min.js',
        }
    },
    concat: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: [
          'tmp/videojs-dash.min.js'
        ],
        dest: 'dist/videojs-dash.min.js'
      },
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
  grunt.registerTask('build', ['clean', 'jshint', 'browserify', 'babel', 'shell:uglifyjs', 'concat']);
  grunt.registerTask('default', ['build', 'test']);
};
