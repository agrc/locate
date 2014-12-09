define([
    'agrc/widgets/map/BaseMap',

    'app/config',

    'dojo/_base/lang',
    'dojo/topic',

    'esri/geometry/Point'
], function(
    BaseMap,

    config,

    lang,
    topic,

    Point
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

            // this.childWidgets.push(
            //     new BaseMapSelector({
            //         map: this.map,
            //         id: 'claro',
            //         position: 'TR'
            //     })
            // );
        },
        addLayer: function (lyr) {
            // summary:
            //      description
            // lyr: Layer
            console.log('app/mapController:addLayer', arguments);
        
            this.map.addLayer(lyr);
            this.map.addLoaderToLayer(lyr);
        }
    };
});