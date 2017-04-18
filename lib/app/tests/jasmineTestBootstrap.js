/* global JasmineFaviconReporter, jasmineRequire */
var dojoConfig = { // eslint-disable-line no-unused-vars
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
