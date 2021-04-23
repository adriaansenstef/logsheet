sap.ui.define([
    "./BaseService",
    "sap/ui/model/Sorter"
], function (CoreService) {
    "use strict";

    var PhaseService = CoreService.extend("pro.dimensys.pm.logsheet.service.PhaseService", {
        constructor: function (model) {
            CoreService.call(this, model);
        },

        getPhases: function (parameters) {
            return this.odata("/PhaseSet").get(parameters);
        },

        getPhase: function (phaseId) {
            var sPath = this.model.createKey("/PhaseSet", {
                PhaseId: phaseId
            });
            return this.odata(sPath).get();
        }

    });

    return PhaseService;
});