define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/templates/Slider.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'slider'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    template,
    topic,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Controls transparency for a layer.

        templateString: template,
        baseClass: 'slider',

        // Properties to be sent into constructor
        // groupName: String
        groupName: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Slider::postCreate', arguments);

            $(this.slider).slider({
                min: 0,
                max: 100,
                value: 50,
                tooltip: 'hide'
            });

            this.inherited(arguments);
        },
        wireEvents: function () {
            // summary:
            //      Called by Group
            console.log('app/Slider:wireEvents', arguments);

            $(this.slider).on('change', lang.hitch(this, 'onChange'));
        },
        onChange: function (evt) {
            // summary:
            //      slider has be changed
            // evt: Event Object
            // console.log('app/Slider:onChange', arguments);

            topic.publish(config.topics.slider.change, evt.value.newValue, this.groupName);
        }
    });
});
