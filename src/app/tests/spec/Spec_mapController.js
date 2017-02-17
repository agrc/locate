require([
    'agrc/widgets/map/BaseMap',

    'app/mapController',

    'dojo/dom-construct'
], function (
    BaseMap,

    objectUnderTest,

    domConstruct
) {
    describe('app/mapController', function () {
        describe('initMap', function () {
            it('create a map', function () {
                var div = domConstruct.create('div', null, document.body);
                objectUnderTest.initMap(div);
                expect(objectUnderTest.map).toEqual(jasmine.any(BaseMap));
                objectUnderTest.destroy();
                domConstruct.destroy(div);
            });
        });
        describe('checkForUTMCoords', function () {
            it('returns unchanged hash if no x, y & scale params are present', function () {
                var input = '';
                expect(objectUnderTest.checkForUTMCoords(input)).toEqual(input);

                // no scale
                input = 'x=123&y123';
                expect(objectUnderTest.checkForUTMCoords(input)).toEqual(input);

                // no x
                input = 'y&1234&scale=123';
                expect(objectUnderTest.checkForUTMCoords(input)).toEqual(input);
            });
            it('returns web mercator coords unchanged', function () {
                var input = 'x=-12454029&y=4970423&scale=144448';
                expect(objectUnderTest.checkForUTMCoords(input)).toEqual(input);
            });
            it('projects utm coords', function () {
                var input = 'x=459620&y=4627278&scale=1155581';
                var output = 'x=-12410568.089658665&y=5130519.954974215&scale=1155581';
                expect(objectUnderTest.checkForUTMCoords(input)).toEqual(output);
            });
            it('doesn\'t overwrite other existing parameters', function () {
                var input = 'x=459620&y=4627278&scale=1155581&hello=1';
                var output = 'x=-12410568.089658665&y=5130519.954974215&scale=1155581&hello=1';
                expect(objectUnderTest.checkForUTMCoords(input)).toEqual(output);
            });
        });
        describe('toggleDynamicLayer', function () {
            var lyr;
            var groupName = 'blah';
            beforeEach(function () {
                lyr = {
                    visibleLayers: [],
                    setVisibleLayers: jasmine.createSpy('setVisibleLayers'),
                    on: function () {},
                    loaded: true
                };
                objectUnderTest.dLayers[groupName] = lyr;
            });
            it('adds new layer ids', function () {
                objectUnderTest.toggleDynamicLayer('0,2', true, groupName, 0.5, true, 'dynamic');

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([0, 2]);
            });
            it('preserves existing layer ids', function () {
                lyr.visibleLayers = [1, 2];

                objectUnderTest.toggleDynamicLayer('3', true, groupName, 0.5, false, 'dynamic');

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([3, 1, 2]);
            });
            it('removes layer ids', function () {
                lyr.visibleLayers = [1, 3];

                objectUnderTest.toggleDynamicLayer('3', false, groupName, 0.5, true, 'dynamic');

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([1]);
            });
            it('shows only one layer at a time for radios', function () {
                lyr.visibleLayers = [2];

                objectUnderTest.toggleDynamicLayer('1', true, groupName, null, true, 'dynamic');

                expect(lyr.setVisibleLayers).toHaveBeenCalledWith([1]);
            });
        });
    });
});
