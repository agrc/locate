define([
    'agrc/modules/Formatting',
    'agrc/modules/WebAPI',

    'app/config',
    'app/mapController',

    'dojo/DeferredList',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/io-query',
    'dojo/string',
    'dojo/text!app/templates/CurrentLocationTemplate.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/html/entities',

    'esri/geometry/Point',

    'handlebars'
], function (
    Formatting,
    WebAPI,

    config,
    mapController,

    DeferredList,
    domClass,
    domConstruct,
    ioQuery,
    dojoString,
    template,
    topic,
    declare,
    lang,

    entities,

    Point,

    handlebars
) {
    return declare(null, {
        // description:
        //      Displays the current location info and button to generate a report.

        templateString: template,
        baseClass: 'current-location',

        // address: String
        address: null,

        // city: String
        city: null,

        // zip: String
        zip: null,

        // county: String
        county: null,

        // lastPoint: {x: ..., y: ...}
        lastPoint: null,


        constructor: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.CurrentLocation:constructor', arguments);

            this.subscribeHandles = [
                topic.subscribe(config.topics.mapClick, lang.hitch(this, 'onMapClick')),
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFind', lang.hitch(this, 'onFindAddress'))
            ];

            this.template = handlebars.compile(template);
        },
        onFindAddress: function (data) {
            // summary:
            //      FindAddress successfully found a point
            // {location: {x: ..., y: ...}}
            console.log('app/CurrentLocation:onFindAddress', arguments);

            mapController.map.infoWindow.hide();

            var point = new Point(data[0].location.x, data[0].location.y, mapController.map.spatialReference);
            this.onMapClick(point, data[0].standardizedAddress);
        },
        toggleLoader: function (show) {
            // summary:
            //      description
            // show: Boolean
            console.log('app/CurrentLocation:toggleLoader', arguments);

            if (show) {
                mapController.map.showLoader();
            } else {
                mapController.map.hideLoader();
            }
        },
        onMapClick: function (point, geocodedAddress) {
            // summary:
            //      user clicked on the map
            // point: Object {x: , y: }
            // geocodedAddress (optional): String
            //      The address that was geocoded
            console.log('app/CurrentLocation:onMapClick', arguments);

            if (!point) {
                return;
            }

            this.toggleLoader(true);

            if (!this.webAPI) {
                this.webAPI = new WebAPI({apiKey: config.apiKey});
            }

            var defaultOptions = {spatialReference: 3857};

            var defs = [
                this.webAPI.reverseGeocode(point.x, point.y, lang.mixin({distance: 50}, defaultOptions)).then((result) => {
                    this.onReverseGeocodeComplete(result, geocodedAddress);
                }, lang.hitch(this, 'onReverseGeocodeError')),
                this.webAPI.search(
                    config.featureClassNames.city,
                    [config.fieldNames.city.NAME],
                    lang.mixin({geometry: 'point:[' + point.x + ',' + point.y + ']'}, defaultOptions)
                ).then(
                    lang.partial(lang.hitch(this, 'onSearchReturn'), 'city', config.fieldNames.city.NAME),
                    lang.partial(lang.hitch(this, 'onSearchError'), 'city')
                ),
                this.webAPI.search(
                    config.featureClassNames.zip,
                    [config.fieldNames.zip.ZIP5],
                    lang.mixin({geometry: 'point:[' + point.x + ',' + point.y + ']'}, defaultOptions)
                ).then(
                    lang.partial(lang.hitch(this, 'onSearchReturn'), 'zip', config.fieldNames.zip.ZIP5),
                    lang.partial(lang.hitch(this, 'onSearchError'), 'zip')
                ),
                this.webAPI.search(
                    config.featureClassNames.county,
                    [config.fieldNames.county.NAME],
                    lang.mixin({geometry: 'point:[' + point.x + ',' + point.y + ']'}, defaultOptions)
                ).then(
                    lang.partial(lang.hitch(this, 'onSearchReturn'), 'county', config.fieldNames.county.NAME),
                    lang.partial(lang.hitch(this, 'onSearchError'), 'county')
                )
            ];
            new DeferredList(defs).then(() => {
                this.toggleLoader(false);

                mapController.map.infoWindow.setTitle('Map Point');
                mapController.map.infoWindow.setContent(this.template(this));
                mapController.map.infoWindow.show(point);
            });

            this.lastPoint = point;
            this.refreshReportLink();
        },
        onSearchReturn: function (type, field, results) {
            // summary:
            //      search request callback
            // type: String
            // field: String
            // results: {attributes: ...}[]
            console.log('app/CurrentLocation:onSearchReturn', arguments);

            var value;
            if (results.length) {
                value = Formatting.titlize(results[0].attributes[field]);
            } else {
                value = entities.encode(dojoString.substitute(config.messages.noValueFound, [type]));
            }

            this[type] = value;
            this.refreshReportLink();
        },
        onSearchError: function (type) {
            // summary:
            //      description
            // type: String
            console.log('app/CurrentLocation:onSearchError', arguments);

            var value = entities.encode(dojoString.substitute(config.messages.noValueFound, [type]));
            this[type] = value;
            this.refreshReportLink();
        },
        onReverseGeocodeComplete: function (result, geocodedAddress) {
            // summary:
            //      description
            // result: Object {address: {street: ...}}
            // geocodedAddress (optional): String
            //      The address that was geocoded
            console.log('app/CurrentLocation:onReverseGeocodeComplete', arguments);

            let value;
            if (geocodedAddress) {
                value = Formatting.titlize(geocodedAddress);
            } else {
                value = (result.address) ? result.address.street :
                    entities.encode(dojoString.substitute(config.messages.noValueFound, ['address']));
            }
            this.address = value;
            this.refreshReportLink();
        },
        onReverseGeocodeError: function () {
            // summary:
            //      reverse geocode returned an error
            console.log('app/CurrentLocation:onReverseGeocodeError', arguments);

            var value = entities.encode(dojoString.substitute(config.messages.noValueFound, ['address']));
            this.address = value;
            this.refreshReportLink();
        },
        refreshReportLink: function () {
            // summary:
            //      description
            console.log('app/CurrentLocation:refreshReportLink', arguments);

            var reportProps = {
                x: this.lastPoint.x,
                y: this.lastPoint.y,
                address: this.address,
                city: this.city,
                zip: this.zip,
                county: this.county
            };

            this.reportLink = 'report.html?' + ioQuery.objectToQuery(reportProps);
        },
        destroy() {
            this.subscribeHandles.forEach((handle) => {
                handle.remove();
            });
        }
    });
});
