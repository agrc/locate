define([
    'app/config',
    'app/FindAddress',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/aspect',
    'dojo/text!app/templates/Search.html',
    'dojo/_base/declare'
], function (
    config,
    FindAddress,
    mapController,

    _TemplatedMixin,
    _WidgetBase,

    aspect,
    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //

        templateString: template,
        baseClass: 'search',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Search::postCreate', arguments);

            var that = this;
            aspect.after(mapController, 'initMap', function () {
                var findAddress = new FindAddress({
                    map: mapController.map,
                    apiKey: config.apiKey,
                    symbol: config.currentLocationSymbol,
                    graphicsLayer: mapController.map.graphics
                }, that.findAddressDiv);
                findAddress.btnGeocode.innerHTML = 'Find Address';
                findAddress.startup();
            });

            this.inherited(arguments);
        }
    });
});
