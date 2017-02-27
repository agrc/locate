require([
    'app/Report',

    'dojo/dom-construct',

    'stubmodule'
], function (
    WidgetUnderTest,

    domConstruct,

    stubmodule
) {
    describe('app/Report', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function (done) {
            stubmodule('app/Report', {
                'dojo/io-query': {queryToObject: function () {
                    return {};
                }}
            }).then(function (StubbedModule) {
                WidgetUnderTest = StubbedModule;
                widget = new WidgetUnderTest({}, domConstruct.create('div', {}, document.body));
                widget.startup();
                done();
            });
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a Report', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('parseSureSitesFeature', function () {
            it('converts Images to a list', function () {
                var inputObject = {
                    Images: 'a, b, c'
                };

                var parsedObject = widget.parseSureSitesFeature(inputObject);

                expect(parsedObject.Images).toEqual(['a', 'b', 'c']);
            });
        });
    });
});
