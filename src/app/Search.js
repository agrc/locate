define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',

    'app/config',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/aspect',
    'dojo/dom-class',
    'dojo/text!app/templates/Search.html',

    'put-selector/put',

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
    domClass,
    template,

    put
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
                    symbol: config.currentLocationSymbol,
                    graphicsLayer: mapController.map.graphics
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
                magicZoom.spinnerDiv.innerHTML = '';
                var spinner = put(magicZoom.spinnerDiv, 'span.glyphicon.glyphicon-refresh.hidden');
                magicZoom.showSpinner = function () {
                    domClass.add(this.searchIconSpan, 'hidden');
                    domClass.remove(spinner, 'hidden');
                };
                magicZoom.hideSpinner = function () {
                    domClass.remove(this.searchIconSpan, 'hidden');
                    domClass.add(spinner, 'hidden');
                };
            });

            this.inherited(arguments);
        }
    });
});