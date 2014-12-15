define([
    'agrc/modules/WebAPI',

    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/DeferredList',
    'dojo/dom-class',
    'dojo/string',
    'dojo/text!app/templates/CurrentLocation.html',
    'dojo/topic',

    'dojox/html/entities',

    'xstyle/css!app/resources/CurrentLocation.css'
], function(
    WebAPI,

    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    DeferredList,
    domClass,
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


        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.CurrentLocation::postCreate', arguments);

            topic.subscribe(config.topics.mapClick, lang.hitch(this, 'onMapClick'));
            this.inherited(arguments);
        },
        onMapClick: function (point) {
            // summary:
            //      user clicked on the map
            // point: Object {x: , y: }
            console.log('app/CurrentLocation:onMapClick', arguments);
        
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
            var that = this;
            new DeferredList(defs).then(function() {
                domClass.remove(that.addressContainer, 'hidden');
                domClass.add(that.helpTxt, 'hidden');
            });
        },
        onSearchReturn: function (type, field, results) {
            // summary:
            //      search request callback
            // type: String
            // field: String
            // results: {attributes: ...}[]
            console.log('app/CurrentLocation:onSearchReturn', arguments);
        
            var value = (results.length) ? results[0].attributes[field] : 
                entities.encode(dojoString.substitute(config.messages.noValueFound, [type]));
            this.set(type, value);
        },
        onSearchError: function (type) {
            // summary:
            //      description
            // type: String
            console.log('app/CurrentLocation:onSearchError', arguments);
        
            var value = entities.encode(dojoString.substitute(config.messages.noValueFound, [type]));
            this.set(type, value);
        },
        onReverseGeocodeComplete: function (result) {
            // summary:
            //      description
            // result: Object {address: {street: ...}}
            console.log('app/CurrentLocation:onReverseGeocodeComplete', arguments);
        
            var value = (result.address) ? result.address.street : 
                entities.encode(dojoString.substitute(config.messages.noValueFound, ['address']));
            this.set('address', value);
        },
        onReverseGeocodeError: function () {
            // summary:
            //      reverse geocode returned an error
            console.log('app/CurrentLocation:onReverseGeocodeError', arguments);
        
            var value = entities.encode(dojoString.substitute(config.messages.noValueFound, ['address']));
            this.set('address', value);
        }
    });
});