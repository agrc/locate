define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/Router',

    'dijit/Destroyable',

    'dojo/dom-style',
    'dojo/hash',
    'dojo/io-query',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/graphic',
    'esri/layers/ArcGISDynamicMapServiceLayer',

    'layer-selector/LayerSelector',

    'proj4'
], function (
    BaseMap,

    config,
    Router,

    Destroyable,

    domStyle,
    hash,
    ioQuery,
    topic,
    declare,
    lang,

    Extent,
    Point,
    Graphic,
    ArcGISDynamicMapServiceLayer,

    LayerSelector,

    proj4
) {
    var MC = declare([Destroyable], {
        // map: BaseMap
        map: null,

        // dLayers: Object
        //      dynamic layers
        dLayers: {},

        // childWidgets: Object[]
        childWidgets: [],

        initMap: function (mapDiv) {
            // summary:
            //      Sets up the map
            console.info('app/mapController:initMap', arguments);

            // switch out UTM for web mercator coords, if exists
            hash(this.checkForUTMCoords(hash()));

            this.map = new BaseMap(mapDiv, {
                useDefaultBaseMap: false,
                extent: new Extent({
                    xmax: -12423300.906798368,
                    xmin: -12494387.343103563,
                    ymax: 4998590.4098829115,
                    ymin: 4923452.811078603,
                    spatialReference: {
                        wkid: 3857
                    }
                }),
                router: true,
                showLabels: true
            });

            this.childWidgets.push(
                new LayerSelector({
                    map: this.map,
                    quadWord: config.quadWord,
                    baseLayers: ['Terrain', 'Hybrid', 'Lite', 'Topo'],
                    overlays: ['Address Points', {
                        Factory: ArcGISDynamicMapServiceLayer,
                        url: config.urls.landOwnership,
                        id: 'Land Ownership',
                        opacity: 0.5
                    }],
                    right: false
                })
            );
            this.childWidgets.push(this.map);

            // force map to auto height
            // required for proper alignment in firefox
            domStyle.set(mapDiv, 'height', 'auto');
            this.map.resize();

            var that = this;
            this.own(
                topic.subscribe(config.topics.addLayer,
                    lang.hitch(this, 'addLayer')),
                topic.subscribe(config.topics.layer.toggleDynamicLayer,
                    lang.hitch(this, 'toggleDynamicLayer')),
                topic.subscribe(config.topics.slider.change,
                    lang.hitch(this, 'onSliderChange')),
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFindStart',
                    lang.hitch(that.map.graphics, 'clear')),
                this.map.on('click', lang.hitch(this, 'onMapClick'))
            );
            setTimeout(function () {
                new Router();
            }, 100);
        },
        checkForUTMCoords: function (urlHash) {
            // summary:
            //      projects utm coords to web mercator if needed
            // urlHash: String
            //      The current URL hash
            // returns: String
            //      The updated (if needed) URL hash
            console.log('app/mapController:checkForUTMCoords', arguments);

            // return hash untouched if missing x, y or scale coords or if they are already
            // in web mercator
            var params = ioQuery.queryToObject(urlHash);
            if (!(params.x && params.y && params.scale) || parseInt(params.x, 10) < 0) {
                return urlHash;
            }

            // project to web mercator and return updated hash
            var utm = '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs';
            var coords = proj4(utm, proj4('EPSG:3857'), [parseInt(params.x), parseInt(params.y)]);
            params.x = coords[0];
            params.y = coords[1];

            return ioQuery.objectToQuery(params);
        },
        addLayer: function (lyr, bottom) {
            // summary:
            //      description
            // lyr: Layer
            // bottom: Boolean
            console.log('app/mapController:addLayer', arguments);

            var index = (bottom) ? 1 : undefined;
            this.map.addLayer(lyr, index);
            this.map.addLoaderToLayer(lyr);
        },
        toggleDynamicLayer: function (layerId, show, groupName, defaultOpacity, isRadio, layerType) {
            // summary:
            //      sets the appropriate visible layers on the dynamic service
            // layerId: String
            //      The id (or id's separated by a comma)
            // show: Boolean
            // groupName: String
            // defaultOpacity: Number
            // isRadio: Boolean
            //      Determines if more than one layer can be shown at a time in a group
            // layerType: String
            console.log('app/mapController:toggleDynamicLayer', arguments);

            if (layerType !== 'dynamic' && groupName && this.dLayers[groupName]) {
                this.dLayers[groupName].setVisibleLayers([-1]);
                return;
            }

            var dLayer;
            var that = this;
            if (!this.dLayers[groupName]) {
                dLayer = this.dLayers[groupName] = new ArcGISDynamicMapServiceLayer(config.urls.mapService, {
                    opacity: defaultOpacity || 0.5
                });
                this.map.addLayer(dLayer, true);
                this.map.addLoaderToLayer(dLayer);
                dLayer.on('load', function () {
                    that.toggleDynamicLayer(layerId, show, groupName, defaultOpacity, isRadio, layerType);
                });
                return;
            } else {
                dLayer = this.dLayers[groupName];
                if (!dLayer.loaded) {
                    dLayer.on('load', function () {
                        that.toggleDynamicLayer(layerId, show, groupName, defaultOpacity, isRadio, layerType);
                    });
                    return;
                }
            }

            var toggleIds = layerId.split(',').map(function (idTxt) {
                return parseInt(idTxt, 10);
            });
            var layerIds;

            if (show) {
                if (isRadio || !dLayer.visibleLayers) {
                    layerIds = toggleIds;
                } else {
                    if (dLayer.visibleLayers.every(function (id) {
                        return toggleIds.indexOf(id) === -1;
                    })) {
                        layerIds = toggleIds.concat(dLayer.visibleLayers);
                    } else {
                        return;
                    }
                }
            } else {
                if (dLayer.visibleLayers) {
                    layerIds = dLayer.visibleLayers.filter(function (id) {
                        return toggleIds.indexOf(id) === -1;
                    });
                } else {
                    return;
                }
            }

            dLayer.setVisibleLayers(layerIds);
        },
        onSliderChange: function (newValue, groupName) {
            // summary:
            //      the user is changing the tranparency slider
            // newValue: Number
            //      0 - 100
            console.log('mapController:onSliderChange', arguments);

            this.dLayers[groupName].setOpacity(newValue / 100);
        },
        onMapClick: function (evt) {
            // summary:
            //      user clicks on the map
            // evt: MapClick Event Object
            console.log('mapController:onMapClick', arguments);

            this.map.graphics.clear();

            // suresite graphic was clicked
            if (evt.graphic && evt.graphic.getLayer().layerId === config.sureSitesLayerIndex) {
                topic.publish(config.topics.mapClick, null)
                return;
            }

            this.map.graphics.add(new Graphic(evt.mapPoint, config.currentLocationSymbol));
            topic.publish(config.topics.mapClick, evt.mapPoint);
        },
        destroy: function () {
            // summary:
            //
            console.log('mapController:destroy', arguments);

            this.childWidgets.forEach(function (w) {
                w.destroy();
            });
        }
    });
    return new MC();
});
