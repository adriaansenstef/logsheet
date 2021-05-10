sap.ui.define([
    "./BaseService",
    "sap/ui/model/Sorter"
], function (CoreService) {
    "use strict";

    var ConfirmationService = CoreService.extend("pro.dimensys.pm.logsheet.service.ConfirmationService", {
        constructor: function (model) {
            CoreService.call(this, model);
        },

        getConfirmations: function (parameters) {
            return this.odata("/ConfirmationSet").get(parameters);
        },

        getConfirmation: function (confirmationNumber, counter) {
            var sPath = this.model.createKey("/ConfirmationSet", {
                ConfirmationNumber: confirmationNumber,
                Counter: counter
            });
            return this.odata(sPath).get();
        }

    });

    return ConfirmationService;
});