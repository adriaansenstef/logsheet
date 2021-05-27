sap.ui.define([
    "./BaseService",
    "sap/ui/model/Sorter"
], function (CoreService) {
    "use strict";

    var MeasurementService = CoreService.extend("pro.dimensys.pm.logsheet.service.MeasurementService", {
        constructor: function (model) {
            CoreService.call(this, model);
        },

        getMeasurementPoints: function (parameters) {
            return this.odata("/MeasurePointSet").get(parameters);
        }

    });

    return MeasurementService;
});