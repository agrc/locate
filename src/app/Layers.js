define([
    'app/config',
    'app/Search',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/query',
    'dojo/text!app/templates/Layers.html',
    'dojo/topic',

    'esri/layers/FeatureLayer',

    'xstyle/css!app/resources/Layers.css'
], function(
    config,
    Search,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    query,
    template,
    topic,

    FeatureLayer
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      

        templateString: template,
        baseClass: 'layers',

        // featureLayers: Object
        featureLayers: null,

        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      description
            console.log('app/Layers:constructor', arguments);
        
            this.featureLayers = {};
        },
        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Layers::postCreate', arguments);

            var search = new Search({}, this.searchDiv);
            search.startup();
            this.own(search);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.Layers::setupConnections', arguments);

            $('.collapse', this.domNode).on('shown.bs.collapse hidden.bs.collapse', function () {
                topic.publish(config.topics.layers.resize);
            });

            query('.toggle-layer', this.domNode).on('click', lang.hitch(this, 'onLayerToggleClick'));
        },
        onLayerToggleClick: function (evt) {
            // summary:
            //      .toggle-layer clicked
            // evt: Click Event Object
            console.log('app/Layers:onLayerToggleClick', arguments);
        
            var layerIds = evt.srcElement.getAttribute('data-layers').split(',');

            var that = this;
            layerIds.forEach(function (id) {
                var lyr;
                if (!that.featureLayers[id]) {
                    lyr = new FeatureLayer(config.urls.mapService + '/' + id);
                    topic.publish(config.topics.addLayer, lyr);
                    that.featureLayers[id] = lyr;

                } else {
                    lyr = that.featureLayers[id];
                    lyr.setVisibility(!lyr.visible);
                }
            });
        }
    });
});