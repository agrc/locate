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
    var domain;
    var quadWord;
    if (has('agrc-build') === 'prod') {
        // *.utah.gov
        apiKey = 'AGRC-D3CDE591211690';
        domain = 'https://mapserv.utah.gov/';
        quadWord = 'parker-magic-special-algebra';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        apiKey = 'AGRC-AC122FA9671436';
        domain = '/';
        quadWord = 'opera-event-little-pinball';
    } else {
        // localhost
        domain = '/';
    }
    var baseUrl = domain + 'arcgis/rest/services/BBEcon/';

    const economyGroupName = 'Econ Development';
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.2.1-1',

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
            landOwnership: 'https://gis.trustlands.utah.gov/server' +
                           '/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/MapServer'
        },
        sureSitesLayerIndex: 30,
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
            city: 'SGID10.BOUNDARIES.Municipalities',
            zip: 'SGID10.BOUNDARIES.ZipCodes',
            county: 'SGID10.BOUNDARIES.Counties'
        },
        fieldNames: {
            city: {NAME: 'NAME'},
            zip: {ZIP5: 'ZIP5'},
            county: {NAME: 'NAME'},
            suresites: {
                Acreage: 'Acreage',
                Address: 'Address',
                City: 'City',
                County: 'County',
                Images: 'Images',
                Name: 'Name',
                Report_JSON: 'Report_JSON',
                Site_ID: 'Site_ID',
                SquareFootage: 'Square_Footage',
                State: 'State',
                Type: 'Type',
                Zip: 'Zip',
                Zoning: 'Zoning'
            }
        },
        markerSymbolWidth: markerSymbolWidth,
        markerSymbolHeight: markerSymbolHeight,
        lineWidth: 6,
        groups: [{
            groupClass: 'demographics',
            name: economyGroupName,
            layers: [{
                name: 'Tax Increment Areas',
                type: 'polygon',
                layerId: '32',
                labelingInfos: [{
                    labelExpressionInfo: { value: '{ENT_DESC}'},
                    minScale: 50000
                }]
            }, {
                name: 'Enterprise Zones',
                type: 'polygon',
                layerId: '19',
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
                layerId: '33',
                labelingInfos: [{
                    labelExpressionInfo: { value: '{GEOID}, {ZoneName}'},
                    minScale: 80000
                }]
            }, {
                name: 'Higher Education Schools',
                type: 'feature',
                layerId: '6',
                marker: 'universities.svg'
            }, {
                name: 'Workforce Services Centers',
                type: 'feature',
                layerId: '29',
                marker: 'employmentcenters.svg'
            }, {
                name: 'Business Resource Centers',
                type: 'feature',
                layerId: '28',
                marker: 'brc.svg'
            }, {
                name: 'Procurement Technical Assistance Centers',
                type: 'feature',
                layerId: '31',
                marker: 'ptac.svg'
            }]
        }, {
            groupClass: 'utilities',
            name: 'Utilities',
            layers: [{
                name: 'Natural Gas Service Areas',
                type: 'polygon',
                layerId: '12',
                checkboxType: 'radio',
                legend: 'Approximate service area of the natural gas distribution network in Utah'
            }, {
                name: 'Electric Utility Territory',
                type: 'polygon',
                layerId: '14',
                checkboxType: 'radio',
                legend: 'Jurisdictional boundaries for Utah\'s electricity providers. ' +
                    'The location report provides the district name.'
            }, {
                name: 'Local Exchange Areas',
                type: 'polygon',
                layerId: '15',
                checkboxType: 'radio',
                legend: 'Territory boundaries for Utah\'s incumbent telephone providers. ' +
                    'The location report shows the provider name.'
            }, {
                name: 'Culinary Water',
                type: 'polygon',
                layerId: '13',
                checkboxType: 'radio',
                legend: 'Jurisdictional boundaries for Utah\'s culinary water districts. ' +
                    'The location report provides the district name.'
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
                layerId: '2|3|4'
            }]
        }, {
            groupClass: 'transportation',
            name: 'Transportation',
            layers: [{
                name: 'Freight Rail',
                type: 'line',
                layerId: '16',
                defaultOpacity: 1,
                color: '#E09525'
            }, {
                name: 'Commuter Rail',
                type: 'feature',
                layerId: '17',
                marker: 'lightrail.svg'
            }, {
                // this is hidden and linked to Commuter rail above
                // see app/App:postCreate
                name: 'lightrail rail (hidden)',
                type: 'line',
                layerId: '18',
                defaultOpacity: 1,
                hidden: true,
                color: '#AD6F29'
            }, {
                // this is hidden and linked to Commuter rail above
                // see app/App:postCreate
                name: 'commuter rail (hidden)',
                type: 'line',
                layerId: '24',
                defaultOpacity: 1,
                hidden: true,
                color: '#AD6F29'
            }, {
                // this is hidden and linked to Commuter rail above
                // see app/App:postCreate
                name: 'commuter rail stations (hidden)',
                type: 'feature',
                layerId: '23',
                marker: 'lightrail.svg',
                hidden: true
            }, {
                name: 'Airports',
                type: 'feature',
                layerId: '5',
                marker: 'airports.svg'
            }, {
                // this is hidden and linked to the layer above
                // see app/App:postCreate
                name: 'slc airport (hidden)',
                type: 'feature',
                layerId: '21',
                marker: 'slcairport.svg',
                markerWidth: 32,
                markerHeight: 44,
                hidden: true
            }, {
                name: 'Major Roads Buffer',
                type: 'dynamic',
                layerId: '22'
            }]
        }, {
            groupClass: 'lifestyle',
            name: 'Lifestyle',
            layers: [{
                name: 'State Parks',
                type: 'feature',
                layerId: '7',
                marker: 'stateparks.svg'
            }, {
                name: 'National Parks & Monuments',
                type: 'feature',
                layerId: '20',
                marker: 'nationalparks.svg'
            }, {
                // this is hidden and linked to the layer above
                // see app/App:postCreate
                name: 'National Parks/Monuments Boundaries (hidden)',
                type: 'dynamic',
                layerId: '26',
                hidden: true
            }, {
                name: 'USFS Boundaries',
                type: 'dynamic',
                layerId: '25'
            }, {
                name: 'Wilderness/Primitive Boundaries',
                type: 'dynamic',
                layerId: '27'
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
