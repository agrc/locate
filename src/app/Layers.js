define([
    'app/config',
    'app/Group',
    'app/Search',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/templates/Layers.html',

    'xstyle/css!app/resources/Layers.css'
], function(
    config,
    Group,
    Search,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    domConstruct,
    query,
    template
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
        postCreate: function() {
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
                that.childWidgets.push(new Group(g, domConstruct.create('div', null, that.groupsContainer)));
            });
            this.own(this.childWidgets);

            this.groupsContainer.children[0].children[0].click();

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