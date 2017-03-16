define([
    'agrc/widgets/locate/FindAddress',

    'dojo/text!app/templates/FindAddress.html',
    'dojo/_base/declare'
], function (
    FindAddress,

    template,
    declare
) {
    return declare([FindAddress], {
        // description:
        //      Overriden to allow for custom markup

        templateString: template,
        zoomLevel: 17
    });
});
