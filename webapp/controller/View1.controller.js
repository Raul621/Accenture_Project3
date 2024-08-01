sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, Filter, FilterOperator, DateFormat) {
    "use strict";

    return Controller.extend("project3.controller.View1", {
        /*
        * ---------------- INITIALIZATION FUNCTION -----------------
        */
        onInit: function () {
            this.getRouter().getRoute("RoutePwDetails").attachPatternMatched(this._onPatternMatched, this);
        },

        /*
        * ---------------- ROW LIMIT CHANGE HANDLER -----------------
        */
        onRowLimitChange: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
            this._setLengthToUsersTable(parseInt(sSelectedKey, 10));
        },

        /*
        * ---------------- SET TABLE LENGTH FUNCTION -----------------
        */
        _setLengthToUsersTable: function (iLength) {
            var oTable = this.getView().byId("dataTable");
            var oColumnTemplate = oTable.getItems()[0].clone();

            oTable.bindAggregation("items", {
                path: 'applicationModel>/HeaderSet',
                template: oColumnTemplate,
                length: iLength
            });
        },

        /*
        * ---------------- DATE FORMATTER FUNCTION -----------------
        */
        formatDate: function (sDate) {
            if (!sDate) return "";

            var iTimestamp = parseInt(sDate.replace(/\/Date\((\d+)\)\//, '$1'), 10);
            var oDate = new Date(iTimestamp);

            return DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" }).format(oDate);
        },

        /*
        * ---------------- CREATOR FORMATTER FUNCTION -----------------
        */
        formatCreator: function (sFirstName, sLastName, sDepartment) {
            return `${sFirstName} ${sLastName} (${sDepartment})`;
        },

        /*
        * ---------------- USER FORMATTER FUNCTION -----------------
        */
        formatUser: function (sFirstName, sLastName, sDepartment) {
            return `${sFirstName} ${sLastName} (${sDepartment})`;
        },

        /*
        * ---------------- SEARCH HANDLER FUNCTION -----------------
        */
        onSearch: function () {
            var aFilter = [];
            var oView = this.getView();
            var oTable = oView.byId("dataTable");
            var oBinding = oTable.getBinding("items");

            // Collect filter values
            var sPWNumber = oView.byId("pwNumberInput").getValue();
            var sStatus = oView.byId("statusInput").getValue();
            var sPlanungsnummer = oView.byId("planungnummerInput").getValue();
            var sVerwendungszweck = oView.byId("verwendungszweckInput").getValue();
            var sProjektnummer = oView.byId("projektnummerInput").getValue();
            var sErsteller = oView.byId("erstellerInput").getValue();
            var sVerwender = oView.byId("verwenderInput").getValue();
            var sErstelldatum = oView.byId("datePicker").getDateValue();

            // Create filters
            if (sPWNumber) {
                aFilter.push(new Filter("PW_NR", FilterOperator.Contains, sPWNumber));
            }
            if (sStatus) {
                aFilter.push(new Filter("TD_BBA_STATUS", FilterOperator.Contains, sStatus));
            }
            if (sPlanungsnummer) {
                aFilter.push(new Filter("BT_NR", FilterOperator.Contains, sPlanungsnummer));
            }
            if (sVerwendungszweck) {
                aFilter.push(new Filter("VRWNG_AUSL", FilterOperator.Contains, sVerwendungszweck));
            }
            if (sProjektnummer) {
                aFilter.push(new Filter("Derivate_ConstructionSet_Project", FilterOperator.Contains, sProjektnummer));
            }
            if (sErsteller) {
                aFilter.push(new Filter({
                    filters: [
                        new Filter("Creator_FirstName", FilterOperator.Contains, sErsteller),
                        new Filter("Creator_LastName", FilterOperator.Contains, sErsteller),
                        new Filter("Creator_Department", FilterOperator.Contains, sErsteller)
                    ],
                    and: false
                }));
            }
            if (sVerwender) {
                aFilter.push(new Filter({
                    filters: [
                        new Filter("User_FirstName", FilterOperator.Contains, sVerwender),
                        new Filter("User_LastName", FilterOperator.Contains, sVerwender),
                        new Filter("User_Department", FilterOperator.Contains, sVerwender)
                    ],
                    and: false
                }));
            }
            if (sErstelldatum) {
                aFilter.push(new Filter("CREATED_ON", FilterOperator.EQ, sErstelldatum));
            }

            // Apply the filters
            oBinding.filter(aFilter);
        },

        /*
        * ---------------- CLEAR FILTER FUNCTION -----------------
        */
        onClear: function () {
            var oView = this.getView();

            // Clear input fields
            oView.byId("pwNumberInput").setValue("");
            oView.byId("statusInput").setValue("");
            oView.byId("planungnummerInput").setValue("");
            oView.byId("verwendungszweckInput").setValue("");
            oView.byId("projektnummerInput").setValue("");
            oView.byId("erstellerInput").setValue("");
            oView.byId("verwenderInput").setValue("");
            oView.byId("datePicker").setValue("");

            // Clear filters
            var oTable = oView.byId("dataTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter([]);
        },

        /*
        * ---------------- ITEM PRESS HANDLER FUNCTION -----------------
        */
        onItemPressClick: function (oEvent) {
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("applicationModel");

            if (oContext) {
                var selectedData = oContext.getObject();

                // Navigate to PwDetails view with parameters
                this.getRouter().navTo("RoutePwDetails", {
                    ANR_KOP: selectedData.ANR_KOP,
                    PW_NR: selectedData.PW_NR,
                    OID_KOP: selectedData.OID_KOP
                });
            } else {
                console.error("No context available");
            }
        },

        /*
        * ---------------- PATTERN MATCH HANDLER FUNCTION -----------------
        */
        _onPatternMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");

            var sANR_KOP = oArgs.ANR_KOP;
            var sPW_NR = oArgs.PW_NR;
            var sOID_KOP = oArgs.OID_KOP;

            // Fetch data from model based on parameters
            var oDetailData = this._getDetailData(sANR_KOP, sPW_NR, sOID_KOP);
            this.getView().getModel("applicationModel").setProperty("/detail", oDetailData);
        },

        /*
        * ---------------- GET DETAIL DATA FUNCTION -----------------
        */
        _getDetailData: function (ANR_KOP, PW_NR, OID_KOP) {
            var oModel = this.getOwnerComponent().getModel("applicationModel");

            // Ensure the data is loaded before processing
            return new Promise(function (resolve, reject) {
                // Check if the model's data is loaded
                oModel.attachRequestCompleted(function () {
                    var oData = oModel.getData();
                    var aData = oData.HeaderSet;

                    // Verify the data is an array
                    if (!Array.isArray(aData)) {
                        console.error("Data is not in expected format: Array");
                        resolve({});
                        return;
                    }

                    // Find the specific detail data
                    var oDetailData = aData.find(function (item) {
                        return item.ANR_KOP === ANR_KOP && item.PW_NR === PW_NR && item.OID_KOP === OID_KOP;
                    });

                    // Resolve with found detail or an empty object
                    resolve(oDetailData || {});
                });

                // Handle potential model loading errors
                oModel.attachRequestFailed(function (oError) {
                    console.error("Error loading data:", oError);
                    resolve({});
                });
            });
        },

        /*
        * ---------------- GET ROUTER FUNCTION -----------------
        */
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        }
    });
});
