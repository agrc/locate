define([
    'app/config',
    'app/CurrentLocation',
    'app/Layers',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/App.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'bootstrap',
    'dijit/layout/ContentPane'
], function (
    config,
    CurrentLocation,
    Layers,
    mapController,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    on,
    query,
    template,
    topic,
    array,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        // map: BaseMap
        map: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App:constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App:postCreate', arguments);

            this.own(
                topic.subscribe(config.topics.toggleMobilePane, this.toggleMobilePane.bind(this)),
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFind', () => {
                    if (domClass.contains(this.sideBar, 'expanded')) {
                        this.toggleMobilePane();
                    }
                })
            );

            $('.expertLogo').tooltip();

            this.childWidgets.push(
                new CurrentLocation({}, this.currentLocationDiv),
                this.layers = new Layers({}, this.layersDiv)
            );

            // hack to wire together the commuter rail layers since
            // they don't support feature and dynamic in the same layer
            // lightrail rail (hidden)
            var syncCheckbox = function (hChbx, evt) {
                hChbx.checked = evt.target.checked;
                on.emit(hChbx, 'change', {bubbles: true});
            };
            var hiddenCheckbox = query('.layer input[value="18"]')[0];
            // Commuter Rail
            var lrCheckbox = query('.layer input[value="17"]')[0];
            on(lrCheckbox, 'change', lang.partial(syncCheckbox, hiddenCheckbox));

            // commuter rail (hidden)
            hiddenCheckbox = query('.layer input[value="24"]')[0];
            on(lrCheckbox, 'change', lang.partial(syncCheckbox, hiddenCheckbox));

            // commuter rail stations (hidden)
            hiddenCheckbox = query('.layer input[value="23"]')[0];
            on(lrCheckbox, 'change', lang.partial(syncCheckbox, hiddenCheckbox));

            // same thing for airports layers
            hiddenCheckbox = query('.layer input[value="21"]')[0];
            // Airports
            lrCheckbox = query('.layer input[value="5"]')[0];
            on(lrCheckbox, 'change', lang.partial(syncCheckbox, hiddenCheckbox));

            // national parks
            hiddenCheckbox = query('.layer input[value="26"]')[0];
            lrCheckbox = query('.layer input[value="20"]')[0];
            on(lrCheckbox, 'change', lang.partial(syncCheckbox, hiddenCheckbox));

            this.inherited(arguments);
        },
        toggleMobilePane() {
            // summary:
            //      expands the side bar to fill the screen (mobile only)
            console.log('app/App:toggleMobilePane', arguments);

            domClass.toggle(this.sideBar, 'expanded');
            domClass.toggle(this.mapDiv, 'hidden');
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App:startup', arguments);

            var that = this;
            mapController.initMap(this.mapDiv);
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        },
        destroy: function () {
            // summary:
            //      description
            console.log('app/App:destroy', arguments);

            mapController.destroy();
            this.inherited(arguments);
        }
    });
});
