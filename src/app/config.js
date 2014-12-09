/* jshint maxlen:false */
define(['dojo/has', 'esri/config'], function (has, esriConfig) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '0.0.0',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        // initialExtent: Object
        //      Defines in what extent the map is initially loaded
        initialExtent: {
            scale: 144447.638572,
            // center: [-121.887, 40.76]
            center: [425132, 4512466]
        },
        topics: {
            layers: {
                resize: 'layers.resize'
            },
            addLayer: 'addLayer'
        },
        urls: {
            mapService: '/arcgis/rest/services/BBEcon/MapServer'
        },
        fieldNames: {

        }
    };

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-A94B063C533889';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-63E1FF17767822';
    }

    return window.AGRC;
});