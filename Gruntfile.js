module.exports = function(grunt) {

  // project configuration
  grunt.initConfig({
    codeclimate: {
      main: {
        options: {
          file: 'coverage/lcov.info',
          token: process.env.CODECLIMATE_REPO_TOKEN
        }
      }
    },
    clean: {
      coverage: ['coverage'],
      tmp: ['tmp']
    },
    mkdir: {
      tmp: {
        options: {
          create: ['tmp']
        }
      }
    },
    mocha_istanbul:{
      coverage: {
        print: 'none',
        quiet: true,
        ignoreLeaks: true,
        excludes: [
          '**/coverage/**',
          '**/example/**',
          '**/node_modules/**',
          '**/test/**'
        ],
        src: [
          'test/test.js'
        ]
      }
    },
    mochaTest: {
      options: {
        slow: 1250,
        timeout: 3000,
        reporter: 'spec',
        ignoreLeaks: true
      },
      src: [
        'test/test.js'
      ]
    },
    jshint: {
      options: {
        jshintrc: true
      },
      src: [
        '*.js',
        'bin/*',
        'lib/**/*.js',
        'test/**/*.js'
      ]
    }
  });

  // load grunt plugins for modules
  grunt.loadNpmTasks('grunt-codeclimate-reporter');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  // register tasks
  grunt.registerTask('coverage', ['clean:coverage','mocha_istanbul:coverage']);
  grunt.registerTask('default', ['clean','lint','test']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('test', ['mkdir:tmp','mochaTest']);

};
