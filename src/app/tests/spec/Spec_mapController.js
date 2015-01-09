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
                var div = domConstruct.create('div', null, document.body);
                objectUnderTest.initMap(div);
                expect(objectUnderTest.map).toEqual(jasmine.any(BaseMap));
                objectUnderTest.destroy();
                domConstruct.destroy(div);
            });
        });
        describe('toggleDynamicLayer', function () {
            var lyr;
            var groupName = 'blah';
            beforeEach(function () {
                lyr = {
                    visibleLayers: [],
                    setVisibleLayers: jasmine.createSpy('setVisibleLayers')
                };
                objectUnderTest.dLayers[groupName] = lyr;
            });
            it('adds new layer ids', function () {
                objectUnderTest.toggleDynamicLayer('0,2', true, groupName);

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([0, 2]);
            });
            it('preserves existing layer ids', function () {
                lyr.visibleLayers = [1, 2];

                objectUnderTest.toggleDynamicLayer('3', true, groupName);

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([3, 1, 2]);
            });
            it('removes layer ids', function () {
                lyr.visibleLayers = [1, 3];

                objectUnderTest.toggleDynamicLayer('3', false, groupName);

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([1]);
            });
            it('shows only one layer at a time for radios', function () {
                lyr.visibleLayers = [2];

                objectUnderTest.toggleDynamicLayer('1', true, groupName, null, true);

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([1]);
            });
        });
    });
});