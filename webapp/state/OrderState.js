sap.ui.define([
	"./BaseState",
	"../model/Order",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseState, Order, Filter, FilterOperator) {
	"use strict";
	var OrderState = BaseState.extend("pro.dimensys.pm.logsheet.state.OrderState", {
		constructor: function (oService) {
			this.data = {
				orders: [],
				display: true
			};
			this.OrderService = oService;
			BaseState.call(this);
		},

		getService: function () {
			return this.OrderService;
		},

		getOrders: function () {
			return this.getService().getOrders({
				urlParameters: {

				}
			}).then((result) => {
				this.setProperty("orders", result.data.results.map((oOrd) => new Order(oOrd)));
				this.updateModel(true);
				return this.getProperty("orders");
			});
		},

		getOrder: function (orderId) {
			return this.getService().getOrder(orderId).then((result) => {
				this.setProperty("order", new Order(result.data));
				this.updateModel(true);
				return this.getProperty("order");
			});
		}
	});
	return OrderState;
});