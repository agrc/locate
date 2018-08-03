require([
    'app/Layers',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/Layers', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function (done) {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();

            // let SureSites:postCreate settimeout complete first
            window.setTimeout(done, 0);
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a Layers', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
