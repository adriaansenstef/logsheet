sap.ui.define([
	"./BaseState",
	"../model/Order",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseState, Order, Filter, FilterOperator) {
	"use strict";
	var OrderState = BaseState.extend("pro.dimensys.pm.logsheet.state.OrderState", {
		constructor: function (oService, oPhaseService, oOperationService) {
			this.data = {
				order: new Order(),
				display: true
			};
			this.OrderService = oService;
			this.PhaseService = oPhaseService;
			this.OperationService = oOperationService;
			BaseState.call(this);
		},

		getService: function () {
			return this.OrderService;
		},
		getPhaseService: function () {
			return this.PhaseService;
		},
		getOperationService: function () {
			return this.OperationService;
		},

		getOrder: function (orderId) {
			return this.getService().getOrder(orderId).then((result) => {
				this.data.order = new Order(result.data);
				//this.setProperty("order", new Order(result.data));
				this.updateModel(true);
				return this.getProperty("order");
			});
		},

		getPhases: function (orderId) {
			return this.getPhaseService().getPhases({
				filters: [new Filter({
					path: "OrderNumber",
					operator: FilterOperator.EQ,
					value1: orderId
				})]
			}).then((result) => {
				this.data.order.setPhases(result.data.results);
				this.updateModel(true);
				return this.getProperty("order");
			});
		},

		getOperations: function(phaseId){
			return this.getOperationService().getOperations({
				filters: [new Filter({
					path: "OrderNumber",
					operator: FilterOperator.EQ,
					value1: this.data.order.orderNumber
				}),
				new Filter({
					path: "PhaseId",
					operator: FilterOperator.EQ,
					value1: phaseId
				}),	
			]
			}).then((result) => {
				this.data.order.setOperations(result.data.results);
				this.updateModel(true);
				return this.getProperty("order");
			});
		}
	});
	return OrderState;
});