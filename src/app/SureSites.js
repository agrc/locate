define([
    'agrc/modules/Formatting',

    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/templates/SureSites.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/layers/FeatureLayer',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/PictureMarkerSymbol',

    'slider'
], function (
    formatting,

    config,

    _TemplatedMixin,
    _WidgetBase,

    template,
    topic,
    declare,
    lang,

    FeatureLayer,
    SimpleRenderer,
    PictureMarkerSymbol
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Sure sites layer and associate filters.
        templateString: template,
        baseClass: 'sure-sites',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app/SureSites:postCreate', arguments);

            $(this.acreageSlider).slider();
            $(this.sqftSlider).slider();

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.log('app/SureSites:setupConnections', arguments);

            $(this.acreageSlider).on('slide', lang.hitch(this, this.onSliderChange));
            $(this.sqftSlider).on('slide', lang.hitch(this, this.onSliderChange));
            $(this.filtersContainer).on('show.bs.collapse', lang.partial(lang.hitch(this, this.toggleLayer), true));
            $(this.filtersContainer).on('hide.bs.collapse', lang.partial(lang.hitch(this, this.toggleLayer), false));
        },
        onSliderChange: function () {
            // summary:
            //      update labels from slider values
            console.log('app/SureSites:onSliderChange', arguments);

            var acreage = this.acreageSlider.value.split(',');
            this.acreageMin.innerHTML = formatting.addCommas(acreage[0]);
            this.acreageMax.innerHTML = formatting.addCommas(acreage[1]);

            var sqft = this.sqftSlider.value.split(',');
            this.sqftMin.innerHTML = formatting.addCommas(sqft[0]);
            this.sqftMax.innerHTML = formatting.addCommas(sqft[1]);
        },
        toggleLayer: function (show) {
            // summary:
            //      toggles the feature layer visibility
            // show: Boolean
            console.log('app/SureSites:toggleLayer', arguments);

            if (show && !this.layer) {
                var markerSymbol = new PictureMarkerSymbol(
                    'app/resources/img/markers/suresites.svg',
                    config.markerSymbolWidth,
                    config.markerSymbolHeight
                );
                markerSymbol.setOffset(0, config.markerSymbolHeight/2);
                this.layer = new FeatureLayer(config.urls.mapService + '/' + config.sureSitesLayerIndex, {
                    outFields: ['*']
                });
                this.layer.setRenderer(new SimpleRenderer(markerSymbol));
                this.layer.on('load', function () {
                    this.layer.on('mouse-over', function () {
                        // var g = evt.graphic;
                        // popup.setContent(g.attributes[this.layer.displayField]);
                        // popup.show(g.geometry);
                    });
                    this.layer.on('mouse-out', function () {
                        // popup.hide();
                    });
                }.bind(this));
                topic.publish(config.topics.addLayer, this.layer);
            }

            this.layer.setVisibility(show);
        }
    });
});
