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

		setConfirmations: function (data) {
			data.map((confirmation) =>
				this.phases
					.filter((phase) => phase.orderNumber === confirmation.OrderNumber && phase.phaseId === confirmation.PhaseId)
					.map((phase) =>
						phase.operations.filter((operation) => operation.operationNumber === confirmation.Operation)
							.map((operation) => operation.addConfirmation(confirmation)))
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
				Executor: this.executor,
				StartDate: this.startDate,
				FinishDate: this.finishDate,
				Phases: this.phases.map((phase) => phase.getJSON())
			}
		}
	});
});