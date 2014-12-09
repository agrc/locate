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
    });
});