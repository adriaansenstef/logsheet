sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time",
	"./Confirmation"
], function (BaseObject, Time, Confirmation) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Operation", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.confirmations = [];
		},

		addConfirmation: function (confirmation) {
			if (!this.confirmations.some(el => el.confirmationNumber === confirmation.ConfirmationNumber && el.counter === confirmation.Counter)) {
				this.confirmations.push(new Confirmation(operation));
			}
		},

		getJSON: function () {
			return {
				OperationNumber: this.operationNumber,
				OrderNumber: this.orderNumber,
				Confirmation: this.confirmation,
				ObjectNumber: this.objectNumber,
				InternalStatus: this.internalStatus,
				NewStatus: this.newStatus
				//Confirmations: this.confirmations.map((confirmation) => confirmation.getJSON())
			}
		}
	});
});