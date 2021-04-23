sap.ui.define([
    "./BaseService",
    "sap/ui/model/Sorter"
], function (CoreService) {
    "use strict";

    var OperationService = CoreService.extend("pro.dimensys.pm.logsheet.service.OperationService", {
        constructor: function (model) {
            CoreService.call(this, model);
        },

        getOperations: function (parameters) {
            return this.odata("/OperationSet").get(parameters);
        },

        getOperation: function (operationId) {
            var sPath = this.model.createKey("/OperationSet", {
                OperationNumber: operationId
            });
            return this.odata(sPath).get();
        }

    });

    return OperationService;
});