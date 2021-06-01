sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("pro.dimensys.pm.logsheet.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// this.OrderState = this.getOwnerComponent().getState(this.getOwnerComponent().ORDER);
			// this.setModel(this.OrderState.getModel(), "orders");

			this.getRouter().getRoute("worklist").attachPatternMatched(this._onPatternMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},

		onSelect: function (oEvent) {
			this.setModel(new JSONModel(oEvent.getParameters()), "selectedFuncLoc");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		_onPatternMatched: function (oEvent) {
			// this.getView().setBusy(true);
			// this.OrderState.getOrders().then((result) => {
			// }).finally(() => {
			// 	this.getView().setBusy(false);
			// });

			let that = this;
			function onPress() {
				that._showObject(oEvent.getSource());
			}
			let table = this.getView().byId("OrderSmartTable").getTable();
			table.attachUpdateFinished(function () {
				let aItems = table.getItems();
				if (aItems.length === 0) return;
				$.each(aItems, function (oIndex, oItem) {
					oItem.detachPress(onPress);
					oItem.setType("Active");
					oItem.attachPress(onPress);
				});
			});

			this.getView().byId("OrderSmartTable").attachBeforeRebindTable(function (oEvent) {
				var oBindingParams = oEvent.getParameter("bindingParams");
				oBindingParams.parameters = oBindingParams.parameters || {};

				var oSmartTable = oEvent.getSource();
				var oSmartFilterBar = that.byId(oSmartTable.getSmartFilterId());

				var technicalObjectValue = oSmartFilterBar.getControlByKey("TechnicalObject").getValue();
				if (technicalObjectValue) {
					let selectedObject = this.getModel("selectedFuncLoc").getData();
					if (selectedObject.objecttype === 'IFLO') {
						oBindingParams.filters.push(new sap.ui.model.Filter("TechnicalObject", "EQ", technicalObjectValue))
					} else if (selectedObject.objecttype === 'EQUI') {
						oBindingParams.filters.push(new sap.ui.model.Filter("EquipmentNumber", "EQ", technicalObjectValue))
					}
				}
			})
		},

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("OrderNumber")
			});
		}

	});
});