define([
    'agrc/widgets/locate/FindAddress',

    'dojo/dom-class',
    'dojo/text!app/templates/FindAddress.html',
    'dojo/_base/declare'
], function (
    FindAddress,

    domClass,
    template,
    declare
) {
    return declare([FindAddress], {
        // description:
        //      Overriden to allow for custom markup

        templateString: template,
        zoomLevel: 17,

        geocodeAddress() {
            // summary:
            //      overriden to show the text boxes after first click
            console.log('app/FindAddress:geocodeAddress', arguments);

            if (domClass.contains(this.textBoxContainer, 'closed')) {
                domClass.remove(this.textBoxContainer, 'closed');
                return;
            }
        }
    });
});
