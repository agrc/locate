require([
    'app/CurrentLocation'
], function (
    WidgetUnderTest
) {
    describe('app/CurrentLocation', function () {
        var currentLocation;
        var destroy = function (currentLocation) {
            currentLocation.destroy();
            currentLocation = null;
        };

        beforeEach(function () {
            currentLocation = new WidgetUnderTest();
        });

        afterEach(function () {
            if (currentLocation) {
                destroy(currentLocation);
            }
        });

        describe('Sanity', function () {
            it('should create a CurrentLocation', function () {
                expect(currentLocation).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('refreshReportLink', function () {
            it('builds the correct URL', function () {
                currentLocation.lastPoint = {x: 1, y: 2};
                currentLocation.address = 'add';
                currentLocation.city = 'city';
                currentLocation.zip = 'zip';
                currentLocation.county = 'county';

                currentLocation.refreshReportLink();

                var expected = 'report.html?x=1&y=2&address=add&city=city&zip=zip&county=county';

                expect(currentLocation.reportLink).toContain(expected);
            });
        });
    });
});
