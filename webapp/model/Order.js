/* globals moment */
sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time",
	"./Phase",
	"./Person",
	"./MeasurementPoint"
], function (BaseObject, Time, Phase, Person, MeasurementPoint) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Order", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.referenceDateTime = new Date();
		},

		setPhases: function (data) {
			this.phases = data.map((phase) => new Phase(phase));
		},

		setPersons: function (data) {
			this.persons = data.map((person) => new Person(person));
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
				ReferenceDate: this.systemStatusTechnical === "I0045" ? this.referenceDateTime : null,
				ReferenceTime: this.systemStatusTechnical === "I0045" ? moment(this.referenceDateTime).utc().format("PTHH[H]mm[M]ss[S]") : null,
				UserStatus: this.userStatus,
				Phase: this.phase,
				ResponsiblePerson: this.responsiblePerson,
				Executor: this.executor,
				StartDate: this.startDate,
				FinishDate: this.finishDate,
				LongText: this.longText,
				Phases: this.phases.map((phase) => phase.getJSON())
			}
		}
	});
});