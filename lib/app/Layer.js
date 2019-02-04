define([
    'app/config',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/text!app/templates/Layer.html',
    'dojo/topic',
    'dojo/_base/declare',

    'esri/Color',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/FeatureLayer',
    'esri/layers/LabelClass',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/CartographicLineSymbol',
    'esri/symbols/Font',
    'esri/symbols/PictureMarkerSymbol',
    'esri/symbols/TextSymbol'
], function (
    config,
    mapController,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domConstruct,
    on,
    template,
    topic,
    declare,

    Color,
    ArcGISTiledMapServiceLayer,
    FeatureLayer,
    LabelClass,
    SimpleRenderer,
    CartographicLineSymbol,
    Font,
    PictureMarkerSymbol,
    TextSymbol
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //

        templateString: template,
        baseClass: 'layer',

        // layer: FeatureLayer || ArcGISTiledMapServiceLayer
        //      The feature layer associated with this widget.
        //      Only applicable with type: feature
        layer: null,

        // Properties to be sent into constructor
        // name: String
        name: null,

        // type: String (dynamic || feature || line || cache)
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
        //      if 'disabled' converts to disabled checkbox
        checkboxType: null,

        // cachedServiceUrl: String
        //      cachedServiceUrl to the cached map service
        cachedServiceUrl: null,


        postCreate: function () {
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
            } else if (this.checkboxType === 'disabled') {
                this.checkbox.disabled = true;
            }

            if (this.marker) {
                domConstruct.create('img', {
                    src: 'app/resources/img/icons/' + this.marker
                }, this.label, 'after');
            }

            var that = this;
            this.own(
                on(this.checkbox, 'change', function () {
                    that.toggleLayer(that.checkbox.checked);
                }),
                topic.subscribe(config.topics.router.toggleLayers, this.onRouterToggleLayers.bind(this))
            );

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
                    delay: 350,
                    container: 'body'
                });
            }
        },
        onRouterToggleLayers(lyrs) {
            console.log('app/Layer:onRouterToggleLayers', arguments);

            var vis = lyrs.indexOf(this.layerId) !== -1;
            this.checkbox.checked = vis;
            this.toggleLayer(vis);
        },
        startup: function () {
            // summary:
            //      description
            console.log('app/Layer:startup', arguments);

            if (this.onByDefault) {
                this.checkbox.checked = true;
                this.toggleLayer(true);
            }

            this.inherited(arguments);
        },
        toggleLayer: function (show) {
            // summary:
            //      toggles this layer on the map
            // show: Boolean
            console.log('app/Layer:toggleLayer', arguments);

            if (show) {
                ga('send', 'event', 'layer', 'on', this.name);
            }

            var popup = mapController.map.infoWindow;
            var that = this;
            switch (this.type) {
                case 'feature':
                    if (!this.layer) {
                        var markerSymbol = new PictureMarkerSymbol(
                            'app/resources/img/markers/' + this.marker,
                            this.markerWidth || config.markerSymbolWidth,
                            this.markerHeight || config.markerSymbolHeight
                        );
                        markerSymbol.setOffset(0, config.markerSymbolHeight / 2);
                        this.layer = new FeatureLayer(config.urls.mapService + '/' + this.layerId, {
                            outFields: ['*']
                        });
                        this.layer.setRenderer(new SimpleRenderer(markerSymbol));
                        this.layer.on('load', function () {
                            that.layer.on('mouse-over', function (evt) {
                                var g = evt.graphic;
                                popup.setContent(g.attributes[that.layer.displayField]);
                                popup.setTitle('');
                                popup.show(g.geometry);
                            });
                            that.layer.on('mouse-out', function () {
                                popup.hide();
                            });
                        });
                        topic.publish(config.topics.addLayer, this.layer);
                    }
                    this.layer.setVisibility(show);
                    break;
                case 'polygon':
                    if (!this.layer) {
                        this.layer = new FeatureLayer(config.urls.mapService + '/' + this.layerId, {
                            outFields: ['*'],
                            opacity: this.defaultOpacity || 0.5
                        });
                        if (this.labelingInfos) {
                            var textSymbol = new TextSymbol().setFont(new Font('10pt').setWeight(Font.WEIGHT_BOLD));
                            var infos = this.labelingInfos.map(function (info) {
                                var labelClass = new LabelClass(info);
                                labelClass.symbol = textSymbol;
                                return labelClass;
                            });
                            this.layer.setLabelingInfo(infos);
                        }
                        topic.publish(config.topics.addLayer, this.layer, true);
                        topic.subscribe(config.topics.slider.change, function (newValue, groupName) {
                            if (groupName === that.groupName) {
                                that.layer.setOpacity(newValue / 100);
                            }
                        });
                        topic.subscribe(config.topics.layer.toggleDynamicLayer, function (id, showLayer, groupName) {
                            if (showLayer && groupName === that.groupName && id !== that.layerId && that.groupName !== config.economyGroupName) {
                                that.layer.hide();
                            }
                        });
                    }
                    this.layer.setVisibility(show);
                    if (this.groupName) {
                        topic.publish(config.topics.layer.toggleDynamicLayer,
                            this.layerId,
                            show,
                            this.groupName,
                            this.defaultOpacity,
                            this.checkboxType === 'radio',
                            this.type);
                    }
                    break;
                case 'line':
                    if (!this.layer) {
                        var lineSymbol = new CartographicLineSymbol(
                            CartographicLineSymbol.STYLE_SOLID,
                            new Color(this.color),
                            config.lineWidth,
                            CartographicLineSymbol.CAP_ROUND,
                            CartographicLineSymbol.JOIN_ROUND
                            );
                        lineSymbol.setColor(new Color(this.color));
                        lineSymbol.setWidth(6);
                        this.layer = new FeatureLayer(config.urls.mapService + '/' + this.layerId, {
                            outFields: ['*']
                        });
                        this.layer.setRenderer(new SimpleRenderer(lineSymbol));
                        topic.publish(config.topics.addLayer, this.layer, true);
                    }
                    this.layer.setVisibility(show);
                    break;
                case 'dynamic':
                    topic.publish(config.topics.layer.toggleDynamicLayer,
                        this.layerId,
                        show,
                        this.groupName,
                        this.defaultOpacity,
                        this.checkboxType === 'radio',
                        this.type);
                    break;
                case 'cached':
                    if (!this.layer) {
                        this.layer = new ArcGISTiledMapServiceLayer(this.cachedServiceUrl, {
                            opacity: this.defaultOpacity || 0.5
                        });
                        topic.publish(config.topics.addLayer, this.layer, true);
                    }
                    this.layer.setVisibility(show);
                    break;
            }
            topic.publish(config.topics.router.updateLayer);
        }
    });
});
