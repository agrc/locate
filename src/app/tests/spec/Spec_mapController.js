require([
    'agrc/widgets/map/BaseMap',

    'app/mapController',

    'dojo/dom-construct'
], function(
    BaseMap,

    objectUnderTest,

    domConstruct
) {
    describe('app/mapController', function() {
        describe('initMap', function() {
            it('create a map', function() {
                objectUnderTest.initMap(domConstruct.create('div'));
                expect(objectUnderTest.map).toEqual(jasmine.any(BaseMap));
            });
        });
        describe('toggleDynamicLayer', function () {
            var lyr;
            beforeEach(function () {
                lyr = {
                    visibleLayers: [],
                    setVisibleLayers: jasmine.createSpy('setVisibleLayers')
                };
                objectUnderTest.dLayer = lyr;
            });
            it('adds new layer ids', function () {
                objectUnderTest.toggleDynamicLayer('0,2', true);

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([0, 2]);
            });
            it('preserves existing layer ids', function () {
                lyr.visibleLayers = [1, 2];

                objectUnderTest.toggleDynamicLayer('3', true);

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([3, 1, 2]);
            });
            it('removes layer ids', function () {
                lyr.visibleLayers = [1, 3];

                objectUnderTest.toggleDynamicLayer('3', false);

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([1]);
            });
        });
    });
});