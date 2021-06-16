sap.ui.define([
	"./BaseState",
	"../model/Order",
	"../model/User",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseState, Order, User, Filter, FilterOperator) {
	"use strict";
	var OrderState = BaseState.extend("pro.dimensys.pm.logsheet.state.OrderState", {
		constructor: function (oService, oPhaseService, oOperationService, oConfirmationService, oPersonService, oMeasurementService, oUserService) {
			this.data = {
				order: new Order(),
				display: true
			};
			this.OrderService = oService;
			this.PhaseService = oPhaseService;
			this.OperationService = oOperationService;
			this.ConfirmationService = oConfirmationService;
			this.PersonService = oPersonService;
			this.MeasurementService = oMeasurementService;
			this.UserService = oUserService;
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
		getConfirmationService: function () {
			return this.ConfirmationService;
		},
		getPersonService: function () {
			return this.PersonService;
		},
		getMeasurementService: function () {
			return this.MeasurementService;
		},
		getUserService: function () {
			return this.UserService;
		},

		getOrder: function (orderId) {
			return this.getService().getOrder(orderId).then((result) => {
				this.data.order = new Order(result.data);
				//this.setProperty("order", new Order(result.data));
				this.updateModel(true);
				return this.getProperty("order");
			});
		},

		updateOrder: function () {
			return this.getService().updateOrder(this.data.order)
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

		getPersons: function (workCenter) {
			let filterOperator = workCenter ? FilterOperator.EQ : FilterOperator.NE;
			return this.getPersonService().getPersons({
				filters: [new Filter({
					path: "WorkCenter",
					operator: filterOperator,
					value1: workCenter
				})]
			}).then((result) => {
				this.data.order.setPersons(result.data.results);
				this.updateModel(true);
				return this.getProperty("order");
			});
		},

		getOperations: function (phaseId) {
			let filterOperator = phaseId ? FilterOperator.EQ : FilterOperator.NE;
			return this.getOperationService().getOperations({
				filters: [new Filter({
					path: "OrderNumber",
					operator: FilterOperator.EQ,
					value1: this.data.order.orderNumber
				}),
				new Filter({
					path: "PhaseId",
					operator: filterOperator,
					value1: phaseId
				}),
				]
			}).then((result) => {
				this.data.order.setOperations(result.data.results);
				this.updateModel(true);
				this.getConfirmationService().getConfirmations({
					filters: [new Filter({
						path: "OrderNumber",
						operator: FilterOperator.EQ,
						value1: this.data.order.orderNumber
					}),
					new Filter({
						path: "PhaseId",
						operator: filterOperator,
						value1: phaseId
					}),
					]
				}).then((result) => {
					this.data.order.setConfirmations(result.data.results);
					this.updateModel(true);
					return this.getProperty("order");
				}).catch((er) => this.getProperty("order"));
			});
		},

		getMeasurepoints: function(operation, orderNumber){
			return this.getMeasurementService().getMeasurementPoints({
				filters: [new Filter({
					path: "OrderNumber",
					operator: FilterOperator.EQ,
					value1: orderNumber
				}), 
				new Filter({
					path: "OperationNumber",
					operator: FilterOperator.EQ,
					value1: operation.operationNumber
				})]
			}).then((result) => {
				this.data.order.setMeasurement(operation, result.data.results);
				this.updateModel(true);
				return this.getProperty("order");
			});
		},

		getUser: function () {
			return this.getUserService().getUser().then((result) => {
				this.data.user = result.data.results.map(user => new User(user))[0];
				this.updateModel(true);
				return this.data.user;
			});
		}
	});
	return OrderState;
});