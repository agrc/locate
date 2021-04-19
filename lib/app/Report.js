define([
    'app/config',


    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/has',
    'dojo/io-query',
    'dojo/query',
    'dojo/request',
    'dojo/text!app/templates/Report.html',
    'dojo/text!app/templates/ReportTemplate.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'handlebars',

    'ijit/modules/_ErrorMessageMixin',

    'bootstrap'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    has,
    ioQuery,
    query,
    request,
    template,
    reportTemplateTxt,
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

        // reportTemplate: Object
        //      handlebars template
        reportTemplate: null,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app/Report:postCreate', arguments);

            AGRC.report = this;

            var props = ioQuery.queryToObject(window.location.href.split('?')[1]);

            this.addressNode.innerHTML = props.address;
            this.cityNode.innerHTML = props.city;
            this.zipNode.innerHTML = props.zip;
            this.countyNode.innerHTML = props.county;

            this.showLoader();
            if (props.x && props.y) {
                this.generateReport(props.x, props.y);

                ga('send', 'event', 'report', [
                    'x:' + props.x,
                    'y:' + props.y,
                    'address:' + props.address,
                    'city:' + props.city,
                    'zip:' + props.zip
                ].join(';'));
            }
            query('a[data-toggle]').on('click', function (evt) {
                evt.preventDefault();
            });
            var re = /^https?:\/\/(.*?)(?:\/|$)/;
            handlebars.registerHelper('link', function (url) {
                var matches = re.exec(url);
                return (matches && matches.length > 1) ? matches[1] : url;
            });

            this.reportTemplate = handlebars.compile(reportTemplateTxt);

            this.inherited(arguments);
        },
        generateReport: function (x, y) {
            // summary:
            //      kicks off gp task
            // x: Number
            // y: Number
            console.log('app/Report:generateReport', arguments);

            request.get(config.urls.gpService, {
                handleAs: 'json',
                query: {x: x, y: y, f: 'json'},
                headers: (has('agrc-build') === 'prod') ? {
                    'X-Requested-With': null
                } : null
            }).then(lang.hitch(this, 'onReportComplete'), lang.hitch(this, 'onError'));
        },
        showLoader: function () {
            // summary:
            //      shows the spinner and hides any error messages
            console.log('app/Report:showLoader', arguments);

            this.hideErrMsg();
            this.reportContainer.innerHTML = '';
            domClass.remove(this.loader, 'hidden');
        },
        hideLoader: function () {
            // summary:
            //      hides the loader spinner
            console.log('app/Report:hideLoader', arguments);

            domClass.add(this.loader, 'hidden');
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

            this.hideLoader();

            if (response.results) {
                this.reportContainer.innerHTML = this.reportTemplate(response.results[0].value);
            } else {
                this.showErrMsg(config.messages.reportError);
            }
        },
        print: function () {
            // summary:
            //      description
            console.log('app/Report:print', arguments);

            // TODO: expand all categories, is there an event to listen to for a system print command?
            window.print();
        }
    });
});
