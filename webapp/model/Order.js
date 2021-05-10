/* globals moment */
sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time",
	"./Phase"
], function (BaseObject, Time, Phase) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Order", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.referenceDateTime = new Date();
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
				ReferenceDate: this.systemStatusTechnical === "I0045" ? this.referenceDateTime : "",
				ReferenceTime: this.systemStatusTechnical === "I0045" ? moment(this.referenceDateTime).utc().format("PTHH[H]mm[M]ss[S]") : "",
				UserStatus: this.userStatus,
				Phase: this.phase,
				ResponsiblePerson: this.responsiblePerson,
				StartDate: this.startDate,
				FinishDate: this.finishDate,
				Phases: this.phases.map((phase) => phase.getJSON())
			}
		}
	});
});