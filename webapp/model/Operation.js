sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time"
], function (BaseObject, Time) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.Operation", {
		constructor: function (data) {
			BaseObject.call(this, data);
		},
		getJSON: function () {
			return {
				OperationNumber: this.operationNumber,
				Remark: this.remark
			}
		}
	});
});