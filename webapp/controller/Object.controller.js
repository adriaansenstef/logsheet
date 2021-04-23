sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
	"use strict";

	return BaseController.extend("pro.dimensys.pm.logsheet.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

			this.OrderState = this.getOwnerComponent()
				.getState(this.getOwnerComponent()
					.ORDER);
			this.setModel(this.OrderState.getModel(), "order");

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		onPhaseSelect: function (oEvent) {
			var sKey = oEvent.getParameter("key");
			this.getModel("appView").setProperty("/busy", true);
			this.OrderState.getOperations(sKey).then(() => {
				this.getModel("appView").setProperty("/busy", false);
			});
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				this.getModel("appView").setProperty("/busy", true);
				this.OrderState.getOrder(sObjectId).then(() => {
					this.OrderState.getPhases(sObjectId).then(() => {
						var phases = this.getModel("order").getData().order.phases;
						this.OrderState.getOperations(phases.length > 0 ? phases[0].phaseId : null).then(() => {
							this.getModel("appView").setProperty("/busy", false);
						}).catch(() => this.getModel("appView").setProperty("/busy", false));
					});
				}
				);
			}.bind(this));
			this.getModel("appView").setProperty("/busy", false);
		}

	});

});