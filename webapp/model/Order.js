sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time",
	"./Phase"
], function (BaseObject, Time, Phase) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Order", {
		constructor: function (data) {
			BaseObject.call(this, data);
		},

		setPhases: function (data) {
			this.phases = data.map((phase) => new Phase(phase));
		},

		setOperations: function (data) {
			data.map((operation) =>
				this.phases
					.filter((phase) => phase.orderNumber === operation.OrderNumber && phase.phaseId === operation.PhaseId)
					.map((phase) => phase.addOperation(operation))
			);
		},

		setConfirmations: function (data) {
			data.map((confirmation) =>
				this.phases
					.filter((phase) => phase.orderNumber === confirmation.OrderNumber && phase.phaseId === confirmation.Phase)
					.map((phase) =>
						phase.operations.filter((operation) => operation.operationNumber === confirmation.Operation)
							.map((operation) => operation.addConfirmation(confirmation)))
			);
		},

		getJSON: function () {
			return {
				OrderNumber: this.orderNumber,
				UserStatus: this.userStatus,
				ResponsiblePerson: this.responsiblePerson,
				Phases: this.phases.map((phase) => phase.getJSON())
			}
		}
	});
});