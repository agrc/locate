(function () {
    // the baseUrl is relavant in source version and while running unit tests.
    // the`typeof` is for when this file is passed as a require argument to the build system
    // since it runs on node, it doesn't have a window object. The basePath for the build system
    // is defined in build.profile.js
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
            ) ? '/src': './',
        packages: [
            'agrc',
            'app',
            'awesome-bootstrap-checkbox',
            'dgrid',
            'dijit',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            'layer-selector',
            'matchers',
            'put-selector',
            'xstyle',
            {
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            },{
                name: 'handlebars',
                location: './handlebars',
                main: 'handlebars'
            },{
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            },{
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
            },{
                name: 'mustache',
                location: './mustache',
                main: 'mustache'
            },{
                name: 'slider',
                location: './seiyria-bootstrap-slider',
                main: 'js/bootstrap-slider'
            },{
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            },{
                name: 'stubmodule',
                location: './stubmodule',
                main: 'src/stub-module'
            }
        ]
    };
    require(config, ['dojo/parser', 'jquery', 'dojo/domReady!'], function (parser) {
        parser.parse();
    });
})();
