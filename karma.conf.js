// Karma configuration
// Generated on Fri Aug 23 2013 17:04:50 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'test/lib/ExtSpec-*/ExtSpec.js',
      'resources/libs/d3/d3.js',
      'resources/libs/popcorn/popcorn-complete.min.js',
      'https://www.google.com/jsapi',
      'app/**/*.js',
      'app.js',
      'test/specs/**/*Spec.js'
    ],

    preprocessors: {
        // source files, that you wanna generate coverage for
        // do not include tests or libraries
        // (these files will be instrumented by Istanbul)
        'app.js': ['coverage'],
        'app/**/*.js': ['coverage']
    },

    // list of files to exclude
    exclude: [

    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['dots', 'junit', 'coverage'],

    junitReporter: {
        outputFile: 'reports/TEST-results.xml'
    },
    coverageReporter: {
        dir: 'coverage/',
        reporters: [{
            type: 'lcov' // for viewing html pages and SonarQube
        }, {
            type: 'cobertura' // for use in Jenkins
        }]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
