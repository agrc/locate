/* global JasmineFaviconReporter, jasmineRequire */
/*jshint unused:false*/
var dojoConfig = {
    baseUrl: '/src/',
    packages: ['dojo', 'matchers', {
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'stub-module'
    }],
    has: {
        'dojo-undef-api': true
    }
};

// stub google analytics
window.ga = function () {};

// for jasmine-favicon-reporter
jasmine.getEnv().addReporter(new JasmineFaviconReporter());
jasmine.getEnv().addReporter(new jasmineRequire.JSReporter2());
