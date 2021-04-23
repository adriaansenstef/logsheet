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
			this.getView().byId("OrderSmartTable").attachDataReceived(function () {
				let aItems = table.getItems();
				if (aItems.length === 0) return;
				$.each(aItems, function (oIndex, oItem) {
					oItem.detachPress(onPress);
					oItem.setType("Active");
					oItem.attachPress(onPress);
				});
			});
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