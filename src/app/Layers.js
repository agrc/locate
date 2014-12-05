define([
    'app/Search',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/text!app/templates/Layers.html',

    'xstyle/css!app/resources/Layers.css'
], function(
    Search,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      

        templateString: template,
        baseClass: 'layers',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Layers::postCreate', arguments);

            var search = new Search({}, this.searchDiv);
            search.startup();
            this.own(search);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.Layers::setupConnections', arguments);

        }
    });
});