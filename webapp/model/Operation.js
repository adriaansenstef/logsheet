sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time",
	"./Confirmation",
	"./MeasurementPoint"
], function (BaseObject, Time, Confirmation, MeasurementPoint) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Operation", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.confirmations = [];
			this.measurements = [];
		},

		addConfirmation: function (confirmation) {
			if (!this.confirmations.some(el => el.confirmationNumber === confirmation.ConfirmationNumber && el.counter === confirmation.Counter)) {
				this.confirmations.push(new Confirmation(confirmation));
			}
		},

		addMeasurement: function (measurement) {
			if (!this.measurements.some(el => el.point === measurement.Point)) {
				this.measurements.push(new MeasurementPoint(measurement));
			}
		},

		getJSON: function () {
			return {
				OperationNumber: this.operationNumber,
				OrderNumber: this.orderNumber,
				Confirmation: this.confirmation,
				ObjectNumber: this.objectNumber,
				InternalStatus: this.internalStatus,
				NewStatus: this.newStatus === '' || (this.newStatus === this.internalStatus && this.newStatus !== 'E0002') ? null : this.newStatus,
				ActualWork: this.actualWork,
				//Confirmations: this.confirmations.map((confirmation) => confirmation.getJSON())
				Measurements: this.measurements.map((measurement) => measurement.getJSON())
			}
		}
	});
});