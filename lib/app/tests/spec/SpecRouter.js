require([
    'app/config',
    'app/Router',

    'dojo/hash',
    'dojo/topic',

    'matchers/src/topics'
], function (
    config,
    ClassUnderTest,

    hash,
    topic,

    topics
) {
    describe('app/Router', function () {
        var testObject;
        var qp;

        beforeEach(function () {
            testObject = new ClassUnderTest(null);
            topics.listen(config.topics.router.toggleLayers);
            qp = testObject.queryParameter;
        });
        afterEach(function () {
            if (testObject) {
                if (testObject.destroy) {
                    testObject.destroy();
                }

                testObject = null;
            }
            hash('');
        });

        describe('Sanity', function () {
            it('should create a Router', function () {
                expect(testObject).toEqual(jasmine.any(ClassUnderTest));
            });
        });
        describe('init', function () {
            it('fires topic with ids', function () {
                hash(qp + '=1&' + qp + '=2&' + qp + '=3');

                testObject.init();

                expect(config.topics.router.toggleLayers).toHaveBeenPublished();
                expect(config.topics.router.toggleLayers).toHaveBeenPublishedWith(['1', '2', '3']);
            });
            it('doesn\'t fire the topic if no selectedLayers in hash', function () {
                testObject.init();

                expect(config.topics.router.toggleLayers).not.toHaveBeenPublished();
            });
        });
    });
});
