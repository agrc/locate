define([
    'agrc/modules/Formatting',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/templates/SureSites.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'slider'
], function (
    formatting,

    _TemplatedMixin,
    _WidgetBase,

    template,
    declare,
    lang
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

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.log('app/SureSites:setupConnections', arguments);

            $(this.acreageSlider).on('slide', lang.hitch(this, this.onSliderChange));
            $(this.sqftSlider).on('slide', lang.hitch(this, this.onSliderChange));
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
        }
    });
});
