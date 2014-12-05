define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/text!app/templates/CurrentLocation.html',

    'xstyle/css!app/resources/CurrentLocation.css'
], function(
    _TemplatedMixin,
    _WidgetBase,
    
    declare,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Displays the current location info and button to generate a report.

        templateString: template,
        baseClass: 'current-location',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.CurrentLocation::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.CurrentLocation::setupConnections', arguments);

        }
    });
});