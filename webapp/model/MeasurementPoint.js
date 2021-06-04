sap.ui.define([
	"./BaseObject",
	"sap/ui/model/type/Time"
], function (BaseObject, Time) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.MeasurementPoint", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.value = parseFloat(data.Value);
			this.lastValue = parseFloat(data.LastValue);
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