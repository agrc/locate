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
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'sherlock/providers/WebAPI',
    'sherlock/Sherlock',

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
    array,
    declare,
    lang,

    WebAPI,
    Sherlock
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
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            // this.version.innerHTML = config.version;

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
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            mapController.initMap(this.mapDiv);
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            var citiesProvider = new WebAPI(
                config.apiKey,
                'SGID10.Boundaries.Municipalities',
                'NAME',
                {wkid: 3857}
            );
            var sherlock = new Sherlock({
                provider: citiesProvider,
                map: mapController.map,
                maxResultsToDisplay: 10,
                placeHolder: 'city name'
            }, this.sherlockDiv);
            sherlock.startup();
            this.own(sherlock);

            this.inherited(arguments);
        },
        destroy: function () {
            // summary:
            //      description
            console.log('app/App:destroy', arguments);

            mapController.destroy();
            this.inherited(arguments);
        },
        onHamburgerClick: function () {
            // summary:
            //      description
            console.log('app/App:onHamburgerClick', arguments);

            domClass.toggle(this.layers.domNode, 'hide-on-small-screen');
        }
    });
});
