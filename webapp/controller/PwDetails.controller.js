sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], function (Controller, UIComponent, JSONModel, DateFormat) {
    "use strict";

    return Controller.extend("project3.controller.PwDetails", {
        onInit: function () {
            // Attach pattern matched handler to route
            this.getRouter().getRoute("RoutePwDetails").attachPatternMatched(this._onPatternMatched, this);
        },
        /*
        * ---------------- PATTERN MATCH FUNCTION -----------------
        */
        _onPatternMatched: function (oEvent) {
            var sANR_KOP = oEvent.getParameter("arguments").ANR_KOP;
            var sPW_NR = oEvent.getParameter("arguments").PW_NR;
            var sOID_KOP = oEvent.getParameter("arguments").OID_KOP;
            var oApplicationModel = this.getView().getModel("applicationModel");
            var aPwList = oApplicationModel.getProperty("/HeaderSet");
            

            var aMatchingUser = aPwList.find(function (oItem) {
                return oItem.ANR_KOP === sANR_KOP && oItem.PW_NR === sPW_NR && oItem.OID_KOP === sOID_KOP;
            });

            

            this.getView().getModel("applicationModel").setProperty("/Header", { ...aMatchingUser });
            this.getView().getModel("applicationModel").setProperty("/HeaderEdit", { ...aMatchingUser });
        },
        /*
        * ---------------- DATE FORMAT FUNCTION -----------------
        */
        formatDate: function (sDate) {
            if (!sDate) return "";

            // Extract the timestamp from the JSON date string
            var iTimestamp = parseInt(sDate.replace(/\/Date\((\d+)\)\//, '$1'), 10);

            // Create a date object
            var oDate = new Date(iTimestamp);

            // Format the date to dd/MM/yyyy
            return DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" }).format(oDate);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /*
        * ---------------- NAV BACK FUNCTION -----------------
        */
        onNavBack: function () {
            this.getRouter().navTo("RouteView1");
        },
        /*
        * ---------------- GET ROUTER FUNCTION -----------------
        */
        onSelectPage: function (oEvent) {
            var sSelectedPage = oEvent.getSource().getText();
            var oViewModel = this.getView().getModel("viewModel");

            // Set the selected page in the view model
            oViewModel.setProperty("/selectedPage", sSelectedPage);

            // Optionally, you might need to trigger a change in the ObjectPageLayout
            var oObjectPageLayout = this.byId("objectPageLayout");
            if (sSelectedPage === 'ALLGEMEINE DATEN') {
                oObjectPageLayout.getSections().forEach(function (section) {
                    section.setVisible(section.getId() === "generalDataSection");
                });
            } else if (sSelectedPage === 'POSITIONEN') {
                oObjectPageLayout.getSections().forEach(function (section) {
                    section.setVisible(section.getId() === "positionsSection");
                });
            }
        },
        onPressEditPwHeader: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel("applicationModel");

            // Retrieve the values to compare
            var sErstellerQX = oModel.getProperty("/Header/Creator_QX");
            var sVerwenderQX = oModel.getProperty("/Header/User_QX");

            // Check if the values are equal
            if (sErstellerQX === sVerwenderQX) {
                // Load the fragment
                this._loadGeneralDataEditFragment();
            } else {
                // Handle the case when the values are not equal, if needed
                sap.m.MessageToast.show("Ersteller and Verwender QX values do not match.");
            }
        },

        _loadGeneralDataEditFragment: function () {
            var oView = this.getView();
            
            // Check if the fragment is already loaded
            if (!this._oGeneralDataEditFragment) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project3.view.GeneralDataEdit",
                    controller: this
                }).then(function (oFragment) {
                    // Create a new fragment instance and place it in the view
                    this._oGeneralDataEditFragment = oFragment;
                    oView.addDependent(oFragment);
                    oFragment.open();
                }.bind(this));
            } else {
                // Fragment is already loaded, just open it
                this._oGeneralDataEditFragment.open();
            }
        },
    });
});