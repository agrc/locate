define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/request',
    'dojo/text!app/templates/Report.html',
    'dojo/text!app/templates/ReportTemplate.html',
    'dojo/topic',

    'handlebars',

    'ijit/modules/_ErrorMessageMixin',

    'xstyle/css!app/resources/Report.css'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    domClass,
    request,
    template,
    reportTemplateTxt,
    topic,

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

            topic.subscribe(config.topics.generateReport, lang.hitch(this, 'generateReport'));

            this.inherited(arguments);
        },
        generateReport: function (currentLocationWidget) {
            // summary:
            //      kicks off gp task
            // x: float
            // y: float
            console.log('app/Report:generateReport', arguments);
        
            this.showLoader();
            var pnt = currentLocationWidget.lastPoint;
            this.locationContainer.innerHTML = currentLocationWidget.addressContainer.innerHTML;

            request.get(config.urls.gpService, {
                handleAs: 'json',
                query: {x: pnt.x, y: pnt.y, f: 'json'}
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
        hideReport: function () {
            // summary:
            //      description
            console.log('app/Report:hideReport', arguments);
        
            topic.publish(config.topics.hideReport);
        },
        print: function () {
            // summary:
            //      description
            console.log('app/Report:print', arguments);
        
            window.print();
        }
    });
});