require([
    'app/CurrentLocation',

    'dojo/dom-class',
    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domClass,
    domConstruct
) {
    describe('app/CurrentLocation', function() {
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
            it('should create a CurrentLocation', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('toggleLoader', function () {
            it('shows loader immediately on the first call but only after a delay on subsequent calls', function () {
                widget.toggleLoader(true);

                expect(domClass.contains(widget.loader, 'hidden')).toBe(false);

                jasmine.clock().install();

                widget.toggleLoader(false);
                widget.toggleLoader(true);

                expect(domClass.contains(widget.loader, 'hidden')).toBe(true);

                jasmine.clock().tick(501);

                expect(domClass.contains(widget.loader, 'hidden')).toBe(false);

                widget.toggleLoader(false);
                widget.toggleLoader(true);
                widget.toggleLoader(false);

                jasmine.clock().tick(501);

                expect(domClass.contains(widget.loader, 'hidden')).toBe(true);

                jasmine.clock().uninstall();
            });
        });
        describe('refreshReportLink', function () {
            it('builds the correct URL', function () {
                widget.lastPoint = {x:1, y:2};
                widget.address = 'add';
                widget.city = 'city';
                widget.zip = 'zip';
                widget.county = 'county';

                widget.refreshReportLink();

                var expected = 'report.html?x=1&y=2&address=add&city=city&zip=zip&county=county';

                expect(widget.getSummaryLink.href).toContain(expected);
            });
        });
    });
});
