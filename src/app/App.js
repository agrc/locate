define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/CurrentLocation',
    'app/Layers',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/App.html',

    'bootstrap',
    'dijit/layout/ContentPane',
    'xstyle/css!app/resources/App.css'
], function(
    BaseMap,

    config,
    CurrentLocation,
    Layers,
    mapController,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    array,
    declare,
    lang,
    domClass,
    on,
    query,
    template
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

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            // this.version.innerHTML = config.version;

            this.childWidgets.push(
                new CurrentLocation({}, this.currentLocationDiv),
                new Layers({}, this.layersDiv)
            );

            // hack to wire together the commuter rail layers since
            // they don't support feature and dynamic in the same layer
            var syncCheckbox = function (hChbx, evt) {
                hChbx.checked = evt.srcElement.checked;
                on.emit(hChbx, 'change', {bubbles: true});
            };
            var hiddenCheckbox = query('.layer input[value="18"]')[0];
            var lrCheckbox = query('.layer input[value="17"]')[0];
            on(lrCheckbox, 'change', lang.partial(syncCheckbox, hiddenCheckbox));

            // same thing for airports layers
            hiddenCheckbox = query('.layer input[value="21"]')[0];
            lrCheckbox = query('.layer input[value="5"]')[0];
            on(lrCheckbox, 'change', lang.partial(syncCheckbox, hiddenCheckbox));

            this.inherited(arguments);
        },
        showReport: function () {
            // summary:
            //      description
            console.log('app/App:showReport', arguments);
        
            mapController.map.setVisibility(false);
            domClass.add(this.mapContainer, 'hidden');
            domClass.remove(this.reportContainer, 'hidden');
        },
        hideReport: function () {
            // summary:
            //      description
            console.log('app/App:hideReport', arguments);
        
            domClass.add(this.reportContainer, 'hidden');
            domClass.remove(this.mapContainer, 'hidden');
            mapController.map.setVisibility(true);
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            mapController.initMap(this.mapDiv);

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
