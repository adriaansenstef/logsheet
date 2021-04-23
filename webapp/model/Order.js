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

		setPhases: function(data){
			this.phases = data.map((phase) => new Phase(phase));
		},

        getJSON: function () {
		}
	});
});