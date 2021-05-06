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

		getJSON: function () {
			return {
				OrderNumber: this.orderNumber,
				SystemStatusTechnical: this.systemStatusTechnical,
				UserStatus: this.userStatus,
				ResponsiblePerson: this.responsiblePerson,
				StartDate: this.startDate,
				FinishDate: this.finishDate,
				Phases: this.phases.map((phase) => phase.getJSON())
			}
		}
	});
});