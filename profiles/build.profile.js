var profile = { // eslint-disable-line no-unused-vars
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/packages',
                'app/run',
                'app/App',
                'app/Report',
                'dojox/gfx/filters',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/svgext',
                'dojox/gfx/shape'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        }
    },
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api': 0,
        'dojo-log-api': 0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates': 0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader': 0,

        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory': 0,

        // We aren’t loading tests in production
        'dojo-test-sniff': 0
    },
    packages: [{
        name: 'handlebars',
        resourceTags: {
            copyOnly: function (filename, mid) {
                return (/.*\.amd.?/).test(mid);
            }
        }
    }, {
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
            // don't bother with .hidden, tests, min, src, and templates
            ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ],
        resourceTags: {
            amd: function amd(filename) {
                return /\.js$/.test(filename);
            }
        }
    }, {
        name: 'proj4',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|html)/]
        ],
        resourceTags: {
            amd: function () {
                return true;
            },
            copyOnly: function () {
                return false
            }
        }
    }, {
        name: 'slider',
        location: './seiyria-bootstrap-slider',
        main: 'dist/bootstrap-slider',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ]
    }],
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'layer-selector']
    }
};
