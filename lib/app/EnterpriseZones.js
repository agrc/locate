define([
    'app/Layer',

    'dojo/text!app/templates/EnterpriseZones.html',
    'dojo/_base/declare'
], function (
    Layer,

    template,
    declare
) {
    return declare([Layer], {
        templateString: template,
        baseClass: 'enterprise-zones layer',

        postMixInProperties() {
            console.log('app/EnterpriseZones:postMixInProperties', arguments);

            // record default layerId for using in the lookup in onYearChange below
            this.currentLayerId = this.layerId;

            this.inherited(arguments);
        },
        onRouterToggleLayers(lyrs) {
            // overriden from app/Layer to take into account the multiple layer ids
            console.log('app/EnterpriseZones:onRouterToggleLayers', arguments);

            const visible = [this.currentLayerId, this.historic1LayerId, this.historic2LayerId].some((id, i) => {
                if (lyrs.indexOf(id) > -1) {
                    this.checkbox.checked = true;
                    this.layerId = id;
                    this.toggleLayer(true);
                    this.select.value = this.select.getElementsByTagName('option')[i].value;

                    return true;
                }

                return false;
            });

            if (!visible) {
                this.checkbox.checked = false;
                this.toggleLayer(false);
            }
        },
        onYearChange(event) {
            console.log('app/EnterpriseZones:onYearChange', arguments);

            this.toggleLayer(false);
            this.layer = null;
            this.layerId = this[`${event.target.value}LayerId`];
            this.checkbox.value = this.layerId;

            if (this.checkbox.checked) {
                this.toggleLayer(true);
            }
        }
    });
});
