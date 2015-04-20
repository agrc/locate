define([
    'agrc/modules/Formatting',
    'agrc/modules/WebAPI',

    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/DeferredList',
    'dojo/dom-class',
    'dojo/io-query',
    'dojo/string',
    'dojo/text!app/templates/CurrentLocation.html',
    'dojo/topic',

    'dojox/html/entities',

    'xstyle/css!app/resources/CurrentLocation.css'
], function(
    Formatting,
    WebAPI,

    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    DeferredList,
    domClass,
    ioQuery,
    dojoString,
    template,
    topic,

    entities
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Displays the current location info and button to generate a report.

        templateString: template,
        baseClass: 'current-location',

        // address: String
        address: null,
        _setAddressAttr: {node: 'addressNode', type: 'innerHTML'},

        // city: String
        city: null,
        _setCityAttr: {node: 'cityNode', type: 'innerHTML'},

        // zip: String
        zip: null,
        _setZipAttr: {node: 'zipNode', type: 'innerHTML'},

        // county: String
        county: null,
        _setCountyAttr: {node: 'countyNode', type: 'innerHTML'},

        // lastPoint: {x: ..., y: ...}
        lastPoint: null,


        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.CurrentLocation::postCreate', arguments);

            this.own(
                topic.subscribe(config.topics.mapClick, lang.hitch(this, 'onMapClick')),
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFind', lang.hitch(this, 'onFindAddress'))
            );
            this.inherited(arguments);
        },
        onFindAddress: function (data) {
            // summary:
            //      FindAddress successfully found a point
            // {location: {x: ..., y: ...}}
            console.log('app/CurrentLocation:onFindAddress', arguments);

            this.onMapClick(data[0].location);
        },
        toggleLoader: function (show) {
            // summary:
            //      description
            // show: Boolean
            console.log('app/CurrentLocation:toggleLoader', arguments);

            var that = this;
            var showLoader = function () {
                domClass.remove(that.loader, 'hidden');
                domClass.add(that.helpTxt, 'hidden');
                domClass.add(that.addressContainer, 'hidden');
            };
            if (this.loaderTimer) {
                clearTimeout(this.loaderTimer);
            }
            if (show) {
                if (!domClass.contains(this.helpTxt, 'hidden')) {
                    showLoader();
                } else {
                    this.loaderTimer = setTimeout(showLoader, 500);
                }
            } else {
                domClass.add(this.loader, 'hidden');
                domClass.remove(this.addressContainer, 'hidden');
            }
        },
        onMapClick: function (point) {
            // summary:
            //      user clicked on the map
            // point: Object {x: , y: }
            console.log('app/CurrentLocation:onMapClick', arguments);

            this.toggleLoader(true);

            if (!this.webAPI) {
                this.webAPI = new WebAPI({apiKey: config.apiKey});
            }

            var defs = [
                this.webAPI.reverseGeocode(point.x, point.y, {distance: 50}).then(
                    lang.hitch(this, 'onReverseGeocodeComplete'),
                    lang.hitch(this, 'onReverseGeocodeError')
                ),
                this.webAPI.search(config.featureClassNames.city,
                    [config.fieldNames.city.NAME],
                    {geometry: 'point:[' + point.x + ',' + point.y + ']'})
                    .then(lang.partial(lang.hitch(this, 'onSearchReturn'), 'city', config.fieldNames.city.NAME),
                        lang.partial(lang.hitch(this, 'onSearchError'), 'city')
                ),
                this.webAPI.search(config.featureClassNames.zip,
                    [config.fieldNames.zip.ZIP5],
                    {geometry: 'point:[' + point.x + ',' + point.y + ']'})
                    .then(lang.partial(lang.hitch(this, 'onSearchReturn'), 'zip', config.fieldNames.zip.ZIP5),
                        lang.partial(lang.hitch(this, 'onSearchError'), 'zip')
                ),
                this.webAPI.search(config.featureClassNames.county,
                    [config.fieldNames.county.NAME],
                    {geometry: 'point:[' + point.x + ',' + point.y + ']'})
                    .then(lang.partial(lang.hitch(this, 'onSearchReturn'), 'county', config.fieldNames.county.NAME),
                        lang.partial(lang.hitch(this, 'onSearchError'), 'county')
                )
            ];
            new DeferredList(defs).then(lang.partial(lang.hitch(this, 'toggleLoader'), false));

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

            this.set(type, value);
            this.refreshReportLink();
        },
        onSearchError: function (type) {
            // summary:
            //      description
            // type: String
            console.log('app/CurrentLocation:onSearchError', arguments);

            var value = entities.encode(dojoString.substitute(config.messages.noValueFound, [type]));
            this.set(type, value);
            this.refreshReportLink();
        },
        onReverseGeocodeComplete: function (result) {
            // summary:
            //      description
            // result: Object {address: {street: ...}}
            console.log('app/CurrentLocation:onReverseGeocodeComplete', arguments);

            var value = (result.address) ? result.address.street :
                entities.encode(dojoString.substitute(config.messages.noValueFound, ['address']));
            this.set('address', value);
            this.refreshReportLink();
        },
        onReverseGeocodeError: function () {
            // summary:
            //      reverse geocode returned an error
            console.log('app/CurrentLocation:onReverseGeocodeError', arguments);

            var value = entities.encode(dojoString.substitute(config.messages.noValueFound, ['address']));
            this.set('address', value);
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

            this.getSummaryLink.href = 'report.html?' + ioQuery.objectToQuery(reportProps);
        },
        onGetSummaryClick: function () {
            // summary:
            //      description
            console.log('app/CurrentLocation:onGetSummaryClick', arguments);
        
            ga('send', 'event', 'report', 'getSummaryClick', 'x:' + this.x + ',y:' + this.y);
        }
    });
});
