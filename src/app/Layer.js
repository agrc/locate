define([
    'app/config',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/text!app/templates/Layer.html',
    'dojo/topic',

    'esri/Color',
    'esri/layers/FeatureLayer',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/CartographicLineSymbol',
    'esri/symbols/PictureMarkerSymbol',

    'xstyle/css!app/resources/Layer.css'
], function(
    config,
    mapController,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    domClass,
    domConstruct,
    on,
    template,
    topic,

    Color,
    FeatureLayer,
    SimpleRenderer,
    CartographicLineSymbol,
    PictureMarkerSymbol
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //

        templateString: template,
        baseClass: 'layer',

        // fLayer: FeatureLayer
        //      The feature layer associated with this widget.
        //      Only applicable with type: feature
        fLayer: null,

        // Properties to be sent into constructor
        // name: String
        name: null,

        // type: String (dynamic || feature)
        type: null,

        // layerId: String
        //      For dynamic layers could be multiple ids
        //      separated by a comma e.g. 2, 3, 4
        //      For feature layers this is always a single value
        layerId: null,

        // onByDefault: Boolean (optional)
        onByDefault: false,

        // defaultOpacity: Number
        defaultOpacity: null,

        // marker: String
        //      svg file name to use as a marker for this layer
        marker: null,

        // groupName: String
        groupName: null,

        // checkboxType: String
        //      if 'radio' then converts to radio button
        checkboxType: null,


        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Layer::postCreate', arguments);

            // convert to radio button
            if (this.checkboxType === 'radio') {
                this.checkbox.type = 'radio';
                this.checkbox.name = this.groupName;
                domClass.remove(this.domNode, 'checkbox');
                domClass.add(this.domNode, 'radio');
            }

            if (this.onByDefault) {
                this.checkbox.checked = true;
            }

            if (this.marker) {
                domConstruct.create('img', {
                    src: 'app/resources/img/icons/' + this.marker
                }, this.label);
            }

            var that = this;
            on(this.checkbox, 'change', function () {
                that.toggleLayer(that.checkbox.checked);
            });

            this.inherited(arguments);

            if (this.hidden) {
                domClass.add(this.domNode, 'hidden');
            }

            if (this.legend) {
                domClass.remove(this.tooltip, 'hidden');
                $(this.tooltip).tooltip({
                    title: this.legend,
                    html: true,
                    placement: 'right',
                    container: 'body',
                    delay: 250
                });
            }
        },
        activate: function () {
            // summary:
            //      shows the layer if the checkbox is selected
            console.log('app/Layer:activate', arguments);

            if (this.checkbox.checked) {
                this.toggleLayer(true);
            }
        },
        toggleLayer: function (show) {
            // summary:
            //      toggles this layer on the map
            // show: Boolean
            console.log('app/Layer:toggleLayer', arguments);

            var popup = mapController.map.infoWindow;
            var that = this;
            if (this.type === 'feature') {
                if (!this.fLayer) {
                    var markerSymbol = new PictureMarkerSymbol(
                        'app/resources/img/markers/' + this.marker,
                        this.markerWidth || config.markerSymbolWidth,
                        this.markerHeight || config.markerSymbolHeight
                    );
                    markerSymbol.setOffset(0, config.markerSymbolHeight/2);
                    this.fLayer = new FeatureLayer(config.urls.mapService + '/' + this.layerId, {
                        outFields: ['*']
                    });
                    this.fLayer.setRenderer(new SimpleRenderer(markerSymbol));
                    this.fLayer.on('load', function () {
                        that.fLayer.on('mouse-over', function (evt) {
                            var g = evt.graphic;
                            popup.setContent(g.attributes[that.fLayer.displayField]);
                            popup.show(g.geometry);
                        });
                        that.fLayer.on('mouse-out', function () {
                            popup.hide();
                        });
                    });
                    topic.publish(config.topics.addLayer, this.fLayer);
                }
                this.fLayer.setVisibility(show);
            } else if (this.type === 'line') {
                if (!this.fLayer) {
                    var lineSymbol = new CartographicLineSymbol(
                        CartographicLineSymbol.STYLE_SOLID,
                        new Color(this.color),
                        config.lineWidth,
                        CartographicLineSymbol.CAP_ROUND,
                        CartographicLineSymbol.JOIN_ROUND
                        );
                    lineSymbol.setColor(new Color(this.color));
                    lineSymbol.setWidth(6);
                    this.fLayer = new FeatureLayer(config.urls.mapService + '/' + this.layerId, {
                        outFields: ['*']
                    });
                    this.fLayer.setRenderer(new SimpleRenderer(lineSymbol));
                    topic.publish(config.topics.addLayer, this.fLayer, true);
                }
                this.fLayer.setVisibility(show);
            } else {
                topic.publish(config.topics.layer.toggleDynamicLayer,
                    this.layerId,
                    show,
                    this.groupName,
                    this.defaultOpacity,
                    this.checkboxType === 'radio');
            }
        }
    });
});
