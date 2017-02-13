define([
    'agrc/modules/Formatting',

    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/debounce',
    'dojo/query',
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

    debounce,
    query,
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

            var range = config.ranges.acreage;
            $(this.acreageSlider).slider({
                min: range.min,
                max: range.max,
                value: [range.min, range.max],
                step: range.step
            });
            range = config.ranges.sqft;
            $(this.sqftSlider).slider({
                min: range.min,
                max: range.max,
                value: [range.min, range.max],
                step: range.step
            });

            this.updateSliderLabels();

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.log('app/SureSites:setupConnections', arguments);

            $(this.acreageSlider).on('slide', debounce(lang.hitch(this, this.updateDefQuery), 250));
            $(this.sqftSlider).on('slide', debounce(lang.hitch(this, this.updateDefQuery), 250));
            $(this.filtersContainer).on('show.bs.collapse', lang.partial(lang.hitch(this, this.toggleLayer), true));
            $(this.filtersContainer).on('hide.bs.collapse', lang.partial(lang.hitch(this, this.toggleLayer), false));
            query('.checkbox>input', this.domNode).onchange(lang.hitch(this, this.updateDefQuery));
        },
        updateDefQuery: function () {
            // summary:
            //      description
            console.log('app/SureSites:updateDefQuery', arguments);

            var defParts = [];

            // county
            if (this.urbanChbx.checked && !this.ruralChbx.checked) {
                defParts.push(config.fieldNames.suresites.County + ' IN (\'' + config.urbanCounties.join('\', \'') + '\')');
            } else if (this.ruralChbx.checked && !this.urbanChbx.checked) {
                defParts.push(config.fieldNames.suresites.County + ' NOT IN (\'' + config.urbanCounties.join('\', \'') + '\')');
            }

            // type
            var types = query('.property-type input:checked', this.domNode).map(function (chbx) {
                return chbx.value;
            });
            if (types.length > 0) {
                defParts.push(config.fieldNames.suresites.Type + ' IN (\'' + types.join('\', \'') + '\')');
            }

            var getSliderValues = function (slider, range, fieldName) {
                var values = slider.value.split(',');
                if (parseInt(values[0], 10) !== range.min || parseInt(values[1], 10) !== range.max) {
                    defParts.push(fieldName + ' >= ' + values[0] + ' AND ' + fieldName + ' <= ' + values[1]);
                }
            };
            getSliderValues(this.acreageSlider, config.ranges.acreage, config.fieldNames.suresites.Acreage);
            getSliderValues(this.sqftSlider, config.ranges.sqft, config.fieldNames.suresites.SquareFootage);

            var def;
            if (defParts.length === 0) {
                def = '1 = 1';
            } else {
                def = defParts.join(' AND ');
            }

            this.layer.setDefinitionExpression(def);

            this.updateSliderLabels();
        },
        updateSliderLabels: function () {
            // summary:
            //      update labels from slider values
            console.log('app/SureSites:updateSliderLabels', arguments);

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
