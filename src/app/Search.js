define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',

    'app/config',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/aspect',
    'dojo/text!app/templates/Search.html',

    'xstyle/css!app/resources/Search.css'
], function(
    FindAddress,
    MagicZoom,

    config,
    mapController,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    aspect,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      

        templateString: template,
        baseClass: 'search',

        // Properties to be sent into constructor

        postCreate: function() {
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
                    symbol: config.currentLocationSymbol
                }, that.findAddressDiv);
                findAddress.btnGeocode.innerHTML = 'Find Address';
                findAddress.startup();

                var magicZoom = new MagicZoom({
                    map: mapController.map,
                    // promptMessage: '',
                    mapServiceURL: config.urls.mapService,
                    searchLayerIndex: config.zoomLocationsIndex,
                    searchField: config.zoomLocationsField,
                    placeHolder: 'search by place name...',
                    maxResultsToDisplay: 10
                }, that.magicZoomDiv);
                magicZoom.startup();
            });

            this.inherited(arguments);
        }
    });
});