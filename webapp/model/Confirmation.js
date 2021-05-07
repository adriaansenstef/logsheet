sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time"
], function (BaseObject, Time) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Confirmation", {
		constructor: function (data) {
			BaseObject.call(this, data);
		},
		getJSON: function () {
			return {
				ConfirmationNumber: this.confirmationNumber
			}
		}
	});
});