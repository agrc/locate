define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',

    'app/config',

    'dojo/dom-class',
    'dojo/on',
    'dojo/text!app/templates/FindAddress.html',
    'dojo/_base/declare',

    'put-selector/put'
], function (
    FindAddress,
    MagicZoom,

    config,

    domClass,
    on,
    template,
    declare,

    put
) {
    return declare([FindAddress], {
        // description:
        //      Overriden to allow for combination with magic zoom.

        templateString: template,
        baseClass: 'find-address',
        widgetsInTemplate: true,
        zoomLevel: 17,

        // Properties to be sent into constructor

        postMixInProperties: function () {
            // summary:
            //      overriden mostly for unit tests
            console.log('app/FindAddress:postMixInProperties', arguments);

            this.wkid = 3857;
        },
        postCreate: function () {
            // summary:
            //      Overrides method of same name in FindAddress
            // tags:
            //      private
            console.log('app/FindAddress:postCreate', arguments);

            this.inherited(arguments);

            var magicZoom = new MagicZoom({
                map: this.map,
                // promptMessage: '',
                mapServiceURL: config.urls.mapService,
                searchLayerIndex: config.zoomLocationsIndex,
                searchField: config.zoomLocationsField,
                placeHolder: 'search by place name...',
                maxResultsToDisplay: 10,
                apiKey: config.apiKey,
                wkid: this.wkid
            }, this.magicZoomDiv);
            magicZoom.startup();
            magicZoom.spinnerDiv.innerHTML = '';
            var spinner = put(magicZoom.spinnerDiv, 'span.glyphicon.glyphicon-refresh.hidden');
            magicZoom.showSpinner = function () {
                domClass.add(this.searchIconSpan, 'hidden');
                domClass.remove(spinner, 'hidden');
            };
            magicZoom.hideSpinner = function () {
                clearTimeout(this._spinTimer);
                domClass.remove(this.searchIconSpan, 'hidden');
                domClass.add(spinner, 'hidden');
            };

            // wire find address zone text box events to magic zoom text box events
            var that = this;
            this.own(
                on(this.txtZone, 'keyup', function () {
                    magicZoom.textBox.value = that.txtZone.value;
                    on.emit(magicZoom.textBox, 'keyup', {bubbles: true});
                }),
                on(this.txtZone, 'focus', function () {
                    on.emit(magicZoom.textBox, 'focus', {bubbles: true});
                }),
                on(this.txtZone, 'blur', function () {
                    on.emit(magicZoom.textBox, 'blur', {bubbles: true});
                })
            );
        }
    });
});
