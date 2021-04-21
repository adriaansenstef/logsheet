/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"pro/dimensys/pm/logsheet/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});