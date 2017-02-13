require([
    'app/SureSites',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/SureSites', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a SureSites', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('updateDefQuery', function () {
            it('builds the appropriate query', function () {
                widget.layer = {
                    setDefinitionExpression: jasmine.createSpy()
                };

                widget.updateDefQuery();

                expect(widget.layer.setDefinitionExpression).toHaveBeenCalledWith('1 = 1');

                widget.urbanChbx.checked = true;
                var def = 'County IN (\'Salt Lake\', \'Utah\', \'Davis\', \'Weber\')';
                widget.updateDefQuery();

                expect(widget.layer.setDefinitionExpression).toHaveBeenCalledWith(def);

                widget.landChbx.checked = true;
                def = 'County IN (\'Salt Lake\', \'Utah\', \'Davis\', \'Weber\') AND Type IN (\'Land\')';
                widget.updateDefQuery();

                expect(widget.layer.setDefinitionExpression).toHaveBeenCalledWith(def);

                widget.ruralChbx.checked = true;
                def = 'Type IN (\'Land\')';
                widget.updateDefQuery();

                expect(widget.layer.setDefinitionExpression).toHaveBeenCalledWith(def);

                widget.acreageSlider.value = ['1,2'];
                def = 'Type IN (\'Land\') AND Acreage >= 1 AND Acreage <= 2';
                widget.updateDefQuery();

                expect(widget.layer.setDefinitionExpression).toHaveBeenCalledWith(def);

                widget.sqftSlider.value = ['3,4'];
                def = 'Type IN (\'Land\') AND Acreage >= 1 AND Acreage <= 2 AND Square_Footage >= 3 AND Square_Footage <= 4';
                widget.updateDefQuery();

                expect(widget.layer.setDefinitionExpression).toHaveBeenCalledWith(def);
            });
        });
    });
});
