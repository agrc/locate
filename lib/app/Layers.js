define([
    'app/config',
    'app/Group',
    'app/Search',
    'app/SureSites',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/templates/Layers.html',
    'dojo/_base/declare'
], function (
    config,
    Group,
    Search,
    SureSites,

    _TemplatedMixin,
    _WidgetBase,

    domConstruct,
    query,
    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //

        templateString: template,
        baseClass: 'layers hide-on-small-screen',

        // featureLayers: Object
        featureLayers: null,

        // childWidgets: _WidgetBase[]
        childWidgets: null,

        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      description
            console.log('app/Layers:constructor', arguments);

            this.featureLayers = {};
            this.childWidgets = [];
        },
        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Layers::postCreate', arguments);

            var search = new Search({}, this.searchDiv);
            search.startup();
            this.own(search);

            var that = this;
            config.groups.forEach(function (g) {
                var grp = new Group(g, domConstruct.create('div', null, that.groupsContainer));
                that.childWidgets.push(grp);
                that.own(grp);
            });

            var sureSites = new SureSites({}, this.sureSitesDiv);
            this.own(sureSites);
            this.childWidgets.push(sureSites);

            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //      description
            console.log('app/Layers:startup', arguments);

            this.childWidgets.forEach(function (w) {
                w.startup();
            });
            this.inherited(arguments);
        }
    });
});
