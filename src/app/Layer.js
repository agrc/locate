define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/text!app/templates/Layer.html',
    'dojo/topic',

    'esri/layers/FeatureLayer',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/PictureMarkerSymbol',

    'xstyle/css!app/resources/Layer.css'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    domClass,
    domConstruct,
    on,
    template,
    topic,

    FeatureLayer,
    SimpleRenderer,
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

        // controlledByParent: Boolean (optional)
        //      This sublayer turns on and off when it's group is toggled
        controlledByParent: false,

        // marker: String
        //      svg file name to use as a marker for this layer
        marker: null,


        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Layer::postCreate', arguments);

            if (this.onByDefault) {
                this.checkbox.checked = true;
            } else if (this.controlledByParent) {
                this.checkbox.checked = true;
                domClass.add(this.label, 'hide-checkbox');
            }

            if (this.marker) {
                domConstruct.create('img', {
                    src: 'app/resources/img/icons/' + this.marker
                }, this.label);
            }

            if (!this.controlledByParent) {
                var that = this;
                on(this.checkbox, 'change', function () {
                    that.toggleLayer(that.checkbox.checked);
                });
            } else {
                domClass.add(this.domNode, 'no-pointer');
            }

            this.inherited(arguments);
        },
        activate: function () {
            // summary:
            //      shows the layer if the checkbox is selected or
            //      controlledByParent is true
            console.log('app/Layer:activate', arguments);
        
            if (this.controlledByParent || this.checkbox.checked) {
                this.toggleLayer(true);
            }
        },
        toggleLayer: function (show) {
            // summary:
            //      toggles this layer on the map
            // show: Boolean
            console.log('app/Layer:toggleLayer', arguments);
            
            if (this.type === 'feature') {
                if (!this.fLayer) {
                    var sym = new PictureMarkerSymbol(
                        'app/resources/img/markers/' + this.marker,
                        config.markerSymbolWidth,
                        config.markerSymbolHeight
                    );
                    sym.setOffset(0, config.markerSymbolHeight/2);
                    this.fLayer = new FeatureLayer(config.urls.mapService + '/' + this.layerId);
                    this.fLayer.setRenderer(new SimpleRenderer(sym));
                    topic.publish(config.topics.addLayer, this.fLayer);
                }
                this.fLayer.setVisibility(show);
            } else {
                topic.publish(config.topics.layer.toggleDynamicLayer, this.layerId, show);
            }
        }
    });
});