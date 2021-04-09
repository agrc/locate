require({
    packages: [
        'agrc',
        'app',
        'awesome-bootstrap-checkbox',
        'dgauges',
        'dgrid',
        'dgrid1',
        'dijit',
        'dojo',
        'dojox',
        'dstore',
        'esri',
        'ijit',
        'layer-selector',
        'moment',
        'put-selector',
        'sherlock',
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
            name: 'proj4',
            location: './proj4/dist',
            main: 'proj4'
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
