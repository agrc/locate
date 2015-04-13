define([
    'app/config',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/debounce',
    'dojo/hash',
    'dojo/io-query',
    'dojo/query',
    'dojo/topic'
], function(
    config,

    declare,
    lang,
    debounce,
    hash,
    ioQuery,
    query,
    topic
) {
    return declare(null, {
        // description:
        //      Handles url routing

        // queryParameter: String
        queryParameter: 'l',


        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      description
            console.log('app/Router::constructor', arguments);
        
            this.init();
        },
        init: function () {
            // summary:
            //      description
            console.log('app/Router:init', arguments);
        
            var urlObj = ioQuery.queryToObject(hash());

            var lyrs = urlObj[this.queryParameter];
            if (lyrs) {
                topic.publish(config.topics.router.toggleLayers, lyrs);
            }

            topic.subscribe(config.topics.router.updateLayer, debounce(lang.hitch(this, 'onUpdateLayer'), 250));
        },
        onUpdateLayer: function () {
            // summary:
            //      updates the hash with the layer id
            console.log('app/Router:onUpdateLayer', arguments);
        
            var urlObj = ioQuery.queryToObject(hash());
            urlObj[this.queryParameter] = query('.group .layer>input').filter(function (node) {
                return node.checked;
            }).map(function (node) {
                return node.value;
            });

            hash(ioQuery.objectToQuery(urlObj), true);
        }
    });
});