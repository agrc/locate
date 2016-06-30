define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/Router',

    'dijit/Destroyable',

    'dojo/dom-style',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/graphic',
    'esri/layers/ArcGISDynamicMapServiceLayer',

    'layer-selector/LayerSelector'
], function(
    BaseMap,

    config,
    Router,

    Destroyable,

    domStyle,
    topic,
    declare,
    lang,

    Extent,
    Point,
    Graphic,
    ArcGISDynamicMapServiceLayer,

    LayerSelector
) {
    var MC = declare([Destroyable], {
        // map: BaseMap
        map: null,

        // dLayers: Object
        //      dynamic layers
        dLayers: {},

        // childWidgets: Object[]
        childWidgets: [],

        initMap: function(mapDiv) {
            // summary:
            //      Sets up the map
            console.info('app/mapController:initMap', arguments);

            this.map = new BaseMap(mapDiv, {
                useDefaultBaseMap: false,
                showAttribution: false,
                extent: new Extent({
                    xmax: -11762120.612131765,
                    xmin: -13074391.513731329,
                    ymax: 5225035.106177688,
                    ymin: 4373832.359194187,
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
                    baseLayers: ['Lite', 'Hybrid', 'Terrain', 'Topo']
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
                this.map.on('load', function () {
                    topic.subscribe('agrc.widgets.locate.FindAddress.OnFindStart',
                        lang.hitch(that.map.graphics, 'clear'));
                    setTimeout(function () {
                        new Router();
                    }, 0);
                }),
                this.map.on('click', lang.hitch(this, 'onMapClick'))
            );
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
                this.map.addLayer(dLayer, 1);
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

            this.dLayers[groupName].setOpacity(newValue/100);
        },
        onMapClick: function (evt) {
            // summary:
            //      user clicks on the map
            // evt: MapClick Event Object
            console.log('mapController:onMapClick', arguments);

            this.map.graphics.clear();
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
