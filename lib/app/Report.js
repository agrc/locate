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
    'dojo/text!app/templates/SureSitesAdditionReportTemplate.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'handlebars',

    'ijit/modules/_ErrorMessageMixin'
], function (
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
    sureSitesAdditionReportTemplateTxt,
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

        // reportTemplate: Object
        //      handlebars template
        reportTemplate: null,

        // sureSitesTemplate: Object
        //      additional sure sites report template
        sureSitesTemplate: null,

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
            } else {
                domClass.remove(this.sureSitesLogo, 'hidden');
                this.getSureSitesReport(props.suresite);

                ga('send', 'event', 'suresites report', [
                    'id:' + props.suresite,
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
            this.sureSitesTemplate = handlebars.compile(sureSitesAdditionReportTemplateTxt);

            this.inherited(arguments);
        },
        getSureSitesReport: function (id) {
            // summary:
            //      queries feature layer and gets the sure site report json
            // param or return
            console.log('app/Report:getSureSitesReport', arguments);

            request(`${config.urls.mapService}/${config.sureSitesLayerIndex}/query`, {
                query: {
                    where: `${config.fieldNames.suresites.Site_ID} = ${id}`,
                    outFields: '*',
                    f: 'json'
                },
                headers: {
                    'X-Requested-With': null
                },
                handleAs: 'json'
            }).then(response => {
                this.hideLoader();

                if (response.features && response.features.length > 0) {
                    this.reportContainer.innerHTML = this.reportTemplate(JSON.parse(response.features[0].attributes[config.fieldNames.suresites.Report_JSON]));
                    this.sureSitesAdditionContainer.innerHTML = this.sureSitesTemplate(this.parseSureSitesFeature(response.features[0].attributes));
                }
            }, lang.hitch(this, 'onError'));
        },
        parseSureSitesFeature: function (attributes) {
            // summary:
            //      description
            // attributes: Object
            console.log('app/Report:parseSureSitesFeature', arguments);

            if (attributes[config.fieldNames.suresites.Images]) {
                attributes[config.fieldNames.suresites.Images] = attributes[config.fieldNames.suresites.Images].split(', ');
            }

            return attributes;
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
