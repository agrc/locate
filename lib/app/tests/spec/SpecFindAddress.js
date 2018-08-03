require([
    'app/FindAddress',
    'app/mapController',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,
    mapController,

    domConstruct
) {
    describe('app/FindAddress', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            mapController.map = {
                loaded: true,
                addLayer: function () {},
                on: function () {},
                removeLayer: function () {},
                spatialReference: {wkid: 3857}
            };

            widget = new WidgetUnderTest({}, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a FindAddress', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
