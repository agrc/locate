define([
    'app/config',

    'bootstrap',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/has',
    'dojo/io-query',
    'dojo/on',
    'dojo/query',
    'dojo/request',
    'dojo/text!app/templates/Report.html',
    'dojo/text!app/templates/ReportTemplate.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'handlebars',

    'ijit/modules/_ErrorMessageMixin'
], function(
    config,

    bootstrap,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    has,
    ioQuery,
    on,
    query,
    request,
    template,
    reportTemplateTxt,
    topic,
    declare,
    lang,

    handlebars,

    _ErrorMessageMixin
) {
    return declare([_WidgetBase, _TemplatedMixin, _ErrorMessageMixin], {
        // description:
        //      HTML report

        templateString: template,
        baseClass: 'report',

        // template: Object
        //      handlebars template
        template: null,

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Report::postCreate', arguments);

            AGRC.report = this;

            var props = ioQuery.queryToObject(window.location.href.split('?')[1]);

            this.addressNode.innerHTML = props.address;
            this.cityNode.innerHTML = props.city;
            this.zipNode.innerHTML = props.zip;
            this.countyNode.innerHTML = props.county;

            this.generateReport(props.x, props.y);
            query('a[data-toggle]').on('click', function (evt) {
                evt.preventDefault();
            });
            var re = /^https?:\/\/(.*?)(?:\/|$)/;
            handlebars.registerHelper('link', function (url) {
                var matches = re.exec(url);
                return (matches && matches.length > 1) ? matches[1] : url;
            });
            this.inherited(arguments);
        },
        generateReport: function (x, y) {
            // summary:
            //      kicks off gp task
            // x: Number
            // y: Number
            console.log('app/Report:generateReport', arguments);

            this.showLoader();

            request.get(config.urls.gpService, {
                handleAs: 'json',
                query: {x: x, y: y, f: 'json'},
                headers: (has('agrc-build') === 'prod') ? {
                    'X-Requested-With': null
                } : null
            }).then(lang.hitch(this, 'onReportComplete'),
                lang.hitch(this, 'onError')
            );

            if (!this.template) {
                this.template = handlebars.compile(reportTemplateTxt);
            }
        },
        showLoader: function () {
            // summary:
            //      shows the spinner and hides any error messages
            console.log('app/Report:showLoader', arguments);

            this.hideErrMsg();
            this.reportContainer.innerHTML = '';
            domClass.remove(this.loader, 'hidden');
        },
        onError: function () {
            // summary:
            //      description
            console.log('app/Report:onError', arguments);

            this.showErrMsg(config.messages.reportError);
            domClass.add(this.loader, 'hidden');
        },
        onReportComplete: function (response) {
            // summary:
            //      task is complete
            // response: {results: [{paramName: 'data', value: ...}]}
            console.log('app/Report:onReportComplete', arguments);

            domClass.add(this.loader, 'hidden');

            if (response.results) {
                this.reportContainer.innerHTML = this.template(response.results[0].value);
            } else {
                this.showErrMsg(config.messages.reportError);
            }
        },
        print: function () {
            // summary:
            //      description
            console.log('app/Report:print', arguments);

            window.print();
        }
    });
});
