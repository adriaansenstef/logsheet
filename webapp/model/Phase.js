sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time",
	"./Operation"
], function (BaseObject, Time, Operation) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Phase", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.operations = [];
		},
		addOperation: function (operation) {
			if (!this.operations.some(el => el.operationNumber === operation.OperationNumber && el.orderNumber === operation.OrderNumber && el.phaseId === operation.PhaseId)) {
				this.operations.push(new Operation(operation));
			}
		},

		getJSON: function () {
			return {
				PhaseId: this.phaseId,
				Operations: this.operations.map((operation) => operation.getJSON())
			}
		}
	});
});