require([
    'app/App',

    'dojo/dom-construct'
], function (
    App,

    domConstruct
) {
    describe('app/App', function () {
        var testWidget;
        beforeEach(function (done) {
            testWidget = new App({}, domConstruct.create('div', {}, document.body));
            testWidget.startup();

            // let SureSites:postCreate settimeout complete first
            window.setTimeout(done, 0);
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(App));
        });
    });
});
