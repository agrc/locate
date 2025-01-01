define([
    'dojo/has',
    'dojo/request/xhr',
    'dojo/text!app/templates/FiberLegend.html',

    'esri/config',
    'esri/symbols/PictureMarkerSymbol'
], function (
    has,
    xhr,
    fiberLegendTxt,

    esriConfig,
    PictureMarkerSymbol
) {
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('discover.agrc.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('gis.trustlands.utah.gov');

    var markerSymbolWidth = 24;
    var markerSymbolHeight = 35;

    var apiKey;
    var domain = 'https://mapserv.utah.gov/';
    var quadWord;
    if (has('agrc-build') === 'prod') {
        // *.utah.gov
        apiKey = 'AGRC-D3CDE591211690';
        quadWord = 'parker-magic-special-algebra';
    } else if (has('agrc-build') === 'stage') {
        // *.dev.utah.gov
        domain = 'https://mapserv.dev.utah.gov/';
        apiKey = 'AGRC-FE1B257E901672';
        quadWord = 'wedding-tactic-enrico-yes';
    } else if (has('agrc-build') === 'preview') {
        // *.dev.utah.gov
        domain = 'https://mapserv.dev.utah.gov/';
        apiKey = 'AGRC-6AA89A3B289449'; // *.web.app/*
        quadWord = 'wedding-tactic-enrico-yes';
    } else {
        // local development
        domain = 'https://mapserv.dev.utah.gov/';
    }
    var baseUrl = domain + 'arcgis/rest/services/BBEcon/';

    const economyGroupName = 'Econ Development';
    const enterpriseZonesName = 'Enterprise Zones';
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.5.19', // x-release-please-version

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: apiKey, // acquire at developer.mapserv.utah.gov
        quadWord: quadWord,
        economyGroupName: economyGroupName,

        // initialExtent: Object
        //      Defines in what extent the map is initially loaded
        initialExtent: {
            scale: 144447.638572,
            center: [-12458405, 4977593]
        },
        topics: {
            addLayer: 'addLayer',
            layer: {
                toggleDynamicLayer: 'layer.toggleDynamicLayer'
            },
            slider: {
                change: 'slider.change'
            },
            mapClick: 'mapContoller.mapClick',
            router: {
                toggleLayers: 'toggleLayers',
                updateLayer: 'updateLayer'
            }
        },
        messages: {
            noValueFound: '[no ${0} found]',
            reportError: 'There was an error generating the report!'
        },
        urls: {
            mapService: baseUrl + 'MapService/MapServer',
            gpService: baseUrl + 'GenerateReport/GPServer/Generate Report/execute',
            landOwnership: 'https://gis.trustlands.utah.gov/hosting/rest/services/Hosted/' +
                'Land_Ownership_WM_VectorTile/VectorTileServer'
        },
        zoomLocationsIndex: 11,
        zoomLocationsField: 'Name',
        currentLocationSymbol: new PictureMarkerSymbol(
            'app/resources/img/markers/currentLocation.svg',
            32,
            44
        ),
        ranges: {
            acreage: {
                min: 0,
                max: 3100,
                step: 1
            },
            sqft: {
                min: 20000,
                max: 1000000,
                step: 5000
            }
        },
        urbanCounties: ['Salt Lake', 'Utah', 'Davis', 'Weber'],
        featureClassNames: {
            city: 'boundaries.municipal_boundaries',
            zip: 'boundaries.zip_code_areas',
            county: 'boundaries.county_boundaries'
        },
        fieldNames: {
            city: {NAME: 'name'},
            zip: {ZIP5: 'zip5'},
            county: {NAME: 'name'}
        },
        markerSymbolWidth: markerSymbolWidth,
        markerSymbolHeight: markerSymbolHeight,
        lineWidth: 6,
        enterpriseZonesName,
        groups: [{
            groupClass: 'demographics',
            name: economyGroupName,
            layers: [{
                name: 'Tax Increment Areas',
                type: 'polygon',
                layerId: '29',
                labelingInfos: [{
                    labelExpressionInfo: { value: '{ENT_DESC}'},
                    minScale: 50000
                }]
            }, {
                name: enterpriseZonesName,
                type: 'polygon',
                layerId: '17',
                historic1LayerId: '31',
                historic2LayerId: '32',
                historic3LayerId: '33',
                labelingInfos: [{
                    labelExpressionInfo: { value: '{ZONENAME} ({VALID})' },
                    minScale: 100000
                }, {
                    labelExpressionInfo: { value: '{ZONENAME}' },
                    minScale: 600000,
                    maxScale: 100000
                }]
            }, {
                name: 'Qualified Opportunity Zones',
                type: 'polygon',
                layerId: '30',
                labelingInfos: [{
                    labelExpressionInfo: { value: '{GEOID}, {ZoneName}'},
                    minScale: 80000
                }]
            }, {
                name: 'Higher Education Schools',
                type: 'feature',
                layerId: '4',
                marker: 'universities.svg'
            }, {
                name: 'Workforce Services Centers',
                type: 'feature',
                layerId: '27',
                marker: 'employmentcenters.svg'
            }, {
                name: 'Business Resource Centers',
                type: 'feature',
                layerId: '26',
                marker: 'brc.svg'
            }, {
                name: 'Procurement Technical Assistance Centers',
                type: 'feature',
                layerId: '28',
                marker: 'ptac.svg'
            }]
        }, {
            groupClass: 'utilities',
            name: 'Utilities',
            layers: [{
                name: 'Natural Gas Service Areas',
                type: 'polygon',
                layerId: '10',
                checkboxType: 'radio',
                legend: 'Approximate service area of the natural gas distribution network in Utah'
            }, {
                name: 'Electric Utility Territory',
                type: 'polygon',
                layerId: '12',
                checkboxType: 'radio',
                legend: 'Jurisdictional boundaries for Utah\'s electricity providers. ' +
                    'The location report provides the district name.'
            }, {
                name: 'Local Exchange Areas',
                type: 'polygon',
                layerId: '13',
                checkboxType: 'radio',
                legend: 'Territory boundaries for Utah\'s incumbent telephone providers. ' +
                    'The location report shows the provider name.'
            }, {
                name: 'Culinary Water',
                type: 'polygon',
                layerId: '11',
                checkboxType: 'radio',
                legend: 'Jurisdictional boundaries for Utah\'s culinary water districts. '
            }, {
                name: 'None',
                type: 'dynamic',
                layerId: '999', // so that no layers are shown
                checkboxType: 'radio',
                onByDefault: true
            }]
        }, {
            groupClass: 'broadband',
            name: 'Broadband',
            layers: [{
                name: 'Fiber',
                type: 'dynamic',
                layerId: '0|1',
                legend: fiberLegendTxt
            }, {
                name: 'All Non-Mobile Broadband (Includes Fiber, DSL, Cable, and Fixed Wireless)',
                type: 'dynamic',
                layerId: '2'
            }]
        }, {
            groupClass: 'transportation',
            name: 'Transportation',
            layers: [{
                name: 'Freight Rail',
                type: 'line',
                layerId: '14',
                defaultOpacity: 1,
                color: '#E09525'
            }, {
                // if you change name make sure to change the code in
                // app/App:postCreate as well
                name: 'Commuter Rail',
                type: 'feature',
                url: 'https://maps.rideuta.com/server/rest/services/Hosted/TRAX_Light_Rail_Stations/FeatureServer/0',
                displayField: 'stationnam',
                marker: 'lightrail.svg'
            }, {
                // this is hidden and linked to Commuter rail above
                // if you change name make sure to change the code in
                // app/App:postCreate as well
                name: 'lightrail rail (hidden)',
                type: 'line',
                url: 'https://maps.rideuta.com/server/rest/services/Hosted/UTA_TRAX_Light_Rail_Routes/FeatureServer/0',
                defaultOpacity: 1,
                hidden: true,
                color: '#AD6F29'
            }, {
                // this is hidden and linked to Commuter rail above
                // if you change name make sure to change the code in
                // app/App:postCreate as well
                name: 'commuter rail (hidden)',
                type: 'line',
                url: 'https://maps.rideuta.com/server/rest/services/Hosted/UTA_FrontRunner_Commuter_Rail_Centerline/FeatureServer/0',
                defaultOpacity: 1,
                hidden: true,
                color: '#AD6F29'
            }, {
                // this is hidden and linked to Commuter rail above
                // if you change name make sure to change the code in
                // app/App:postCreate as well
                name: 'commuter rail stations (hidden)',
                type: 'feature',
                url: 'https://maps.rideuta.com/server/rest/services/Hosted/FrontRunnerStations/FeatureServer/0',
                marker: 'lightrail.svg',
                hidden: true
            }, {
                name: 'Airports',
                type: 'feature',
                layerId: '3',
                marker: 'airports.svg'
            }, {
                // this is hidden and linked to the layer above
                // if you change the layerId make sure to change the code in
                // app/App:postCreate as well
                name: 'slc airport (hidden)',
                type: 'feature',
                layerId: '19',
                marker: 'slcairport.svg',
                markerWidth: 32,
                markerHeight: 44,
                hidden: true
            }, {
                name: 'Major Roads Buffer',
                type: 'dynamic',
                layerId: '20'
            }]
        }, {
            groupClass: 'lifestyle',
            name: 'Lifestyle',
            layers: [{
                name: 'State Parks',
                type: 'feature',
                layerId: '5',
                marker: 'stateparks.svg'
            }, {
                name: 'National Parks & Monuments',
                type: 'feature',
                layerId: '18',
                marker: 'nationalparks.svg'
            }, {
                // this is hidden and linked to the layer above
                // if you change the layerId make sure to change the code in
                // app/App:postCreate as well
                name: 'National Parks/Monuments Boundaries (hidden)',
                type: 'dynamic',
                layerId: '24',
                hidden: true
            }, {
                name: 'USFS Boundaries',
                type: 'dynamic',
                layerId: '23'
            }, {
                name: 'Wilderness/Primitive Boundaries',
                type: 'dynamic',
                layerId: '25'
            }, {
                name: 'Ski Areas',
                type: 'feature',
                layerId: '6',
                marker: 'skiing.svg'
            }, {
                name: 'Golf Courses',
                type: 'feature',
                layerId: '7',
                marker: 'golfing.svg'
            }, {
                name: 'Hospitals',
                type: 'feature',
                layerId: '8',
                marker: 'hospitals.svg'
            }]
        }]
    };

    if (!has('agrc-build')) {
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            window.AGRC.quadWord = secrets.quadWord;
            window.AGRC.apiKey = secrets.apiKey;
        }, function () {
            console.error('Error getting secrets!');
            window.AGRC.quadWord = 'test';
            window.AGRC.apiKey = 'test';
        });
    }

    window.AGRC.currentLocationSymbol.setOffset(0, 22);

    return window.AGRC;
});
