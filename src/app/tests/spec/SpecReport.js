require([
    'app/Report',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domConstruct
) {
    describe('app/Report', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a Report', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
