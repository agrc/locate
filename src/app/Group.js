define([
    'app/config',
    'app/Layer',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/text!app/templates/Group.html',
    'dojo/topic',

    'xstyle/css!app/resources/Group.css'
], function(
    config,
    Layer,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    domConstruct,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Group of layers.

        templateString: template,
        baseClass: 'group',

        // layerWidgets: Layer[]
        layerWidgets: null,


        // Properties to be sent into constructor

        // groupClass: String
        //      class name for color
        groupClass: null,

        // name: String
        name: null,

        // layers: Object[]
        // {
        //     name: 'Other Fixed Broadband',
        //     type: 'dynamic',
        //     layerIds: [2, 3, 4]
        // }
        layers: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Group::postCreate', arguments);

            var that = this;
            $(this.layersContainer).on('hidden.bs.collapse', function () {
                topic.publish(config.topics.layers.resize);
                that.layerWidgets.forEach(function (l) {
                    l.toggleLayer(false);
                });
            }); 
            $(this.layersContainer).on('shown.bs.collapse', function () {
                topic.publish(config.topics.layers.resize);
                that.layerWidgets.forEach(function (l) {
                    l.activate();
                });
            });

            this.layerWidgets = [];
            this.layers.forEach(function (l) {
                that.layerWidgets.push(
                    new Layer(l, domConstruct.create('div', null, that.layersContainer))
                );
            });

            this.inherited(arguments);
        }
    });
});