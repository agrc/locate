define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/CurrentLocation',
    'app/Layers',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/text!app/templates/App.html',
    'dojo/topic',

    'esri/geometry/Point',

    'bootstrap',
    'dijit/layout/ContentPane'
], function(
    BaseMap,

    config,
    CurrentLocation,
    Layers,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    array,
    declare,
    lang,
    template,
    topic,

    Point
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        // map: BaseMap
        map: null,

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            // this.version.innerHTML = config.version;

            this.childWidgets.push(
                new CurrentLocation({}, this.currentLocationDiv),
                new Layers({}, this.layersDiv)
            );

            this.inherited(arguments);
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            this.initMap();

            this.inherited(arguments);
        },
        initMap: function() {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
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

            // this.childWidgets.push(
            //     new BaseMapSelector({
            //         map: this.map,
            //         id: 'claro',
            //         position: 'TR'
            //     })
            // );
        }
    });
});
