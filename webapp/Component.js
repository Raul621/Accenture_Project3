/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "sap/ui/model/json/JSONModel"
    ],
    function (UIComponent, Device, JSONModel) {
        "use strict";

        return UIComponent.extend("project3.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                var oApplicationModel = new JSONModel("./model/data.json");
                this.setModel(oApplicationModel,"applicationModel");
                this.getRouter().initialize();

                // set the device model
                // this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);