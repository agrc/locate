/* jshint maxlen:false */
define([
    'dojo/has',

    'esri/config',
    'esri/symbols/PictureMarkerSymbol'
], function (
    has,

    esriConfig,
    PictureMarkerSymbol
) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');


    var markerSymbolWidth = 24;
    var markerSymbolHeight = 35;
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
            center: [425132, 4512466]
        },
        topics: {
            layers: {
                resize: 'layers.resize'
            },
            addLayer: 'addLayer',
            layer: {
                toggleDynamicLayer: 'layer.toggleDynamicLayer'
            },
            slider: {
                change: 'slider.change'
            },
            mapClick: 'mapContoller.mapClick',
            generateReport: 'generateReport',
            hideReport: 'hideReport'
        },
        messages: {
            noValueFound: '<No ${0} found>',
            reportError: 'There was an error generating the report!'
        },
        urls: {
            mapService: '/arcgis/rest/services/BBEcon/MapService/MapServer',
            gpService: '/arcgis/rest/services/BBEcon/GenerateReport/GPServer/Generate Report/execute'
        },
        zoomLocationsIndex: 11,
        zoomLocationsField: 'Name',
        currentLocationSymbol: new PictureMarkerSymbol(
            'app/resources/img/markers/currentLocation.svg',
            markerSymbolWidth,
            markerSymbolHeight
        ),
        featureClassNames: {
            city: 'SGID10.BOUNDARIES.Municipalities',
            zip: 'SGID10.BOUNDARIES.ZipCodes',
            county: 'SGID10.BOUNDARIES.Counties'
        },
        fieldNames: {
            city: {NAME: 'NAME'},
            zip: {ZIP5: 'ZIP5'},
            county: {NAME: 'NAME'}
        },
        markerSymbolWidth: markerSymbolWidth,
        markerSymbolHeight: markerSymbolHeight,
        groups: [{
            groupClass: 'broadband',
            name: 'Broadband',
            layers: [{
                name: 'Fiber Short Term',
                type: 'dynamic',
                layerId: '0',
                onByDefault: true
            }, {
                name: 'Fiber Custom Order',
                type: 'dynamic',
                layerId: '1',
                onByDefault: true
            }, {
                name: 'Other Fixed Broadband',
                type: 'dynamic',
                layerId: '2, 3, 4',
                onByDefault: false
            }]
        }, {
            groupClass: 'utilities',
            name: 'Utilities',
            layers: [{
                name: 'Natural Gas Service Areas',
                type: 'dynamic',
                layerId: '12'
            }, {
                name: 'Electric Provider',
                type: 'dynamic',
                layerId: '14'
            }, {
                name: 'Local Exchange Areas',
                type: 'dynamic',
                layerId: '15'
            }, {
                name: 'Culinary Water',
                type: 'dynamic',
                layerId: '13'
            }]
        }, {
            groupClass: 'transportation',
            name: 'Transportation',
            layers: [{
                name: 'Airports',
                type: 'feature',
                layerId: '5',
                marker: 'airports.svg'
            }, {
                name: 'Light/Commuter Rail',
                type: 'feature',
                layerId: '17',
                marker: 'lightrail.svg'
            }, {
                // this is hidden and linked to the layer above
                // see app/App:postCreate
                name: 'commuter rail (hidden)',
                type: 'dynamic',
                layerId: '18',
                defaultOpacity: 1,
                hidden: true
            }, {
                name: 'Heavy Rail',
                type: 'dynamic',
                layerId: '16',
                defaultOpacity: 1
            }]
        }, {
            groupClass: 'demographics',
            name: 'Workforce',
            layers: [{
                name: 'Higher Education Schools',
                type: 'feature',
                layerId: '6',
                marker: 'universities.svg'
            }, {
                name: 'Enterprise Zones',
                type: 'dynamic',
                layerId: '19'
            }]
        }, {
            groupClass: 'lifestyle',
            name: 'Lifestyle',
            layers: [{
                name: 'National Parks, National Monuments, State Parks',
                type: 'feature',
                layerId: '7',
                marker: 'parks.svg'
            }, {
                name: 'Ski Areas',
                type: 'feature',
                layerId: '8',
                marker: 'skiing.svg'
            }, {
                name: 'Golf Courses',
                type: 'feature',
                layerId: '9',
                marker: 'golfing.svg'
            }, {
                name: 'Hospitals',
                type: 'feature',
                layerId: '10',
                marker: 'hospitals.svg'
            }]
        }]
    };

    window.AGRC.currentLocationSymbol.setOffset(0, markerSymbolHeight/2);

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-A94B063C533889';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-7F8F0DA6655711';
    }

    return window.AGRC;
});