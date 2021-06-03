sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time"
], function (BaseObject, Time) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.MeasurementPoint", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.value = parseFloat(data.Value) == '0' ? '' : parseFloat(data.Value);
		},
		getJSON: function () {
			return {
				Point: this.point,
				Value: this.value.toString(),
				Unit: this.unit
			}
		}
	});
});