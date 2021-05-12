sap.ui.define(["sap/m/UploadCollection"],
	function (UploadCollection) {
		"use strict";

		var oUploadCollection = UploadCollection.extend("pro.dimensys.pm.logsheet.controls.UploadCollection", {

			metadata: {},

			setUploadUrl: function (value) {
				this.setProperty("instantUpload", true, true); // disables the default check
				if (sap.m.UploadCollection.prototype.setUploadUrl) {
					sap.m.UploadCollection.prototype.setUploadUrl.apply(this, arguments); // ensure that the default setter is called. Doing so ensures that every extension or change will be executed as well.
					// Because before we call the original function we override the instantUpload property for short time, to disable the check
				}
				this.setProperty("instantUpload", false, true); // Afterwords we set back the instantUpload property to be back in a save and consistent state
			},

			renderer: "sap.m.UploadCollectionRenderer"
		});

		return oUploadCollection;

	}, /* bExport= */ true);