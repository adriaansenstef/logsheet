sap.ui.define([
	"./BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("pro.dimensys.pm.logsheet.model.User", {
		constructor: function (data) {
			BaseObject.call(this, data);
		}
	});
});