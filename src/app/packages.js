require({
    packages: [
        'agrc',
        'app',
        'awesome-bootstrap-checkbox',
        'dgrid',
        'dgauges',
        'dijit',
        'dojo',
        'dojox',
        'esri',
        'ijit',
        'layer-selector',
        'moment',
        'put-selector',
        'sherlock',
        'xstyle',
        {
            name: 'bootstrap',
            location: './bootstrap',
            main: 'dist/js/bootstrap'
        }, {
            name: 'handlebars',
            location: './handlebars',
            main: 'handlebars'
        }, {
            name: 'jquery',
            location: './jquery/dist',
            main: 'jquery'
        }, {
            name: 'ladda',
            location: './ladda-bootstrap',
            main: 'dist/ladda'
        }, {
            name: 'mustache',
            location: './mustache',
            main: 'mustache'
        }, {
            name: 'slider',
            location: './seiyria-bootstrap-slider',
            main: 'dist/bootstrap-slider'
        }, {
            name: 'spin',
            location: './spinjs',
            main: 'spin'
        }
    ],
    map: {
        'sherlock': {
            'spinjs': 'spin'
        }
    }
});
