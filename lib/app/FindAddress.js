define([
    'agrc/widgets/locate/FindAddress',

    'app/config',
    'app/mapController',

    'dojo/dom-class',
    'dojo/on',
    'dojo/text!app/templates/FindAddress.html',
    'dojo/_base/declare',

    'sherlock/providers/WebAPI',
    'sherlock/Sherlock'
], function (
    FindAddress,

    config,
    mapController,

    domClass,
    on,
    template,
    declare,

    WebAPI,
    Sherlock
) {
    return declare([FindAddress], {
        // description:
        //      Overriden to allow for custom markup

        templateString: template,
        zoomLevel: 17,

        postCreate() {
            // summary:
            //      setup widget
            console.log('app/FindAddress:postCreate', arguments);

            this.inherited(arguments);

            var citiesProvider = new WebAPI(
                config.apiKey,
                'SGID10.LOCATION.ZoomLocations',
                'Name',
                {wkid: 3857}
            );
            var sherlock = new Sherlock({
                provider: citiesProvider,
                map: mapController.map,
                maxResultsToDisplay: 10,
                placeHolder: 'city, zip, place, etc.'
            }, this.sherlockDiv);
            sherlock.startup();

            let updateTextBox = () => {
                this.txtZone.value = sherlock.textBox.value;
            };
            this.own(
                sherlock,
                on(sherlock.textBox, 'keyup', updateTextBox),
                sherlock.on('zoomed', updateTextBox)
            );
        },
        geocodeAddress() {
            // summary:
            //      overriden to show the text boxes after first click
            console.log('app/FindAddress:geocodeAddress', arguments);

            if (domClass.contains(this.textBoxContainer, 'closed')) {
                domClass.remove(this.textBoxContainer, 'closed');
                return;
            }

            this.inherited(arguments);
        }
    });
});
