define([
    'agrc/widgets/map/BaseMap',

    'app/config',

    'dojo/_base/lang',
    'dojo/topic',

    'esri/geometry/Point',
    'esri/layers/ArcGISDynamicMapServiceLayer'
], function(
    BaseMap,

    config,

    lang,
    topic,

    Point,
    ArcGISDynamicMapServiceLayer
) {
    return {
        // map: BaseMap
        map: null,

        initMap: function(mapDiv) {
            // summary:
            //      Sets up the map
            console.info('app/mapController:initMap', arguments);

            this.map = new BaseMap(mapDiv, {
                defaultBaseMap: 'Terrain',
                showAttribution: false,
                center: new Point(config.initialExtent.center, {
                    wkid: 26912
                }),
                scale: config.initialExtent.scale
            });
            this.map.disableScrollWheelZoom();

            topic.subscribe(config.topics.layers.resize, 
                lang.hitch(this.map, 'resize'));

            topic.subscribe(config.topics.addLayer,
                lang.hitch(this, 'addLayer'));

            topic.subscribe(config.topics.layer.toggleDynamicLayer, 
                lang.hitch(this, 'toggleDynamicLayer'));

            this.dLayer = new ArcGISDynamicMapServiceLayer(config.urls.mapService, {
                opacity: 0.5
            });
            this.addLayer(this.dLayer);
        },
        addLayer: function (lyr) {
            // summary:
            //      description
            // lyr: Layer
            console.log('app/mapController:addLayer', arguments);
        
            this.map.addLayer(lyr);
            this.map.addLoaderToLayer(lyr);
        },
        toggleDynamicLayer: function (layerId, show) {
            // summary:
            //      sets the appropriate visible layers on the dynamic service
            // layerId: String
            //      The id (or id's separated by a comma)
            // show: Boolean
            console.log('app/mapController:toggleDynamicLayer', arguments);
        
            var toggleIds = layerId.split(',').map(function (idTxt) {
                return parseInt(idTxt, 10);
            });
            var layerIds;

            if (show) {
                layerIds = toggleIds.concat(this.dLayer.visibleLayers);
            } else {
                layerIds = this.dLayer.visibleLayers.filter(function (id) {
                    return toggleIds.indexOf(id) === -1;
                });
            }

            this.dLayer.setVisibleLayers(layerIds);
        }
    };
});