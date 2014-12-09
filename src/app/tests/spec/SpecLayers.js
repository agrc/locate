require([
    'app/Layers',

    'dojo/dom-construct',

    'esri/layers/FeatureLayer'
], function(
    WidgetUnderTest,

    domConstruct,

    FeatureLayer
) {
    describe('app/Layers', function() {
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
            it('should create a Layers', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('onLayerToggleClick', function () {
            var obj = {
                srcElement: {
                    getAttribute: function () {
                        return '0,1';
                    }
                }
            };
            it('creates a new feature layer if it doesn\'t already exist', function () {
                widget.onLayerToggleClick(obj);

                expect(widget.featureLayers['0']).toEqual(jasmine.any(FeatureLayer));
                expect(widget.featureLayers['1']).toEqual(jasmine.any(FeatureLayer));

                var lyr = widget.featureLayers['0'];

                widget.onLayerToggleClick(obj);

                expect(widget.featureLayers['0']).toBe(lyr);
            });
            it('toggles visibility of existing layers', function () {
                var spy = jasmine.createSpy('setVisibility');
                widget.featureLayers['0'] = {
                    visible: true,
                    setVisibility: spy
                };

                widget.onLayerToggleClick(obj);

                expect(spy).toHaveBeenCalledWith(false);

                widget.featureLayers['0'].visible = false;
                widget.onLayerToggleClick(obj);

                expect(spy).toHaveBeenCalledWith(true);
            });
        });
    });
});
