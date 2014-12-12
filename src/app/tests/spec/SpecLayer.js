require([
    'matchers/src/topics',

    'app/config',
    'app/Layer',

    'dojo/dom-construct',

    'stubmodule'
], function(
    topics,

    config,
    WidgetUnderTest,

    domConstruct,

    stubmodule
) {
    describe('app/Layer', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                name: 'hello'
            }, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a Layer', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('activate', function () {
            it('calls toggle with appropriate arguments', function () {
                spyOn(widget, 'toggleLayer');

                widget.controlledByParent = true;

                widget.activate();

                expect(widget.toggleLayer).toHaveBeenCalledWith(true);

                widget.controlledByParent = false;
                widget.checkbox.checked = true;

                widget.activate();

                expect(widget.toggleLayer).toHaveBeenCalledWith(true);

                widget.checkbox.checked = false;

                widget.activate();

                expect(widget.toggleLayer.calls.count()).toBe(2);
            });
        });
        describe('toggleLayer', function () {
            it('creates a new feature layer', function (done) {
                var spy = jasmine.createSpy('FeatureLayer').and.returnValue({
                    setVisibility: function () {},
                    setRenderer: function () {}
                });

                stubmodule('app/Layer', {
                    'esri/layers/FeatureLayer': spy
                }).then(function (StubbedModule) {
                    var testWidget2 = new StubbedModule({
                        type: 'feature',
                        layerId: '0',
                        name: 'hello2'
                    }, domConstruct.create('div', {}, document.body));

                    testWidget2.toggleLayer(true);
                    testWidget2.toggleLayer(false);

                    expect(spy.calls.count()).toBe(1);
                    destroy(testWidget2);
                    done();
                });
            });
            it('calls setVisibility on feature layers', function () {
                var spy = jasmine.createSpy('setVisibility');
                widget.fLayer = {setVisibility: spy};
                widget.type = 'feature';

                widget.toggleLayer(true);

                expect(spy).toHaveBeenCalledWith(true);
            });
            it('publishes the topic for dynamic', function () {
                topics.listen(config.topics.layer.toggleDynamicLayer);

                widget.type = 'dynamic';
                widget.layerId = '0';

                widget.toggleLayer(true);

                expect(config.topics.layer.toggleDynamicLayer).toHaveBeenPublishedWith(widget.layerId, true);
            });
        });
    });
});
