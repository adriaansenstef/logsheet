sap.ui.define([
    "./BaseService",
    "sap/ui/model/Sorter"
], function (CoreService) {
    "use strict";

    var PersonService = CoreService.extend("pro.dimensys.pm.logsheet.service.Person", {
        constructor: function (model) {
            CoreService.call(this, model);
        },

        getPersons: function (parameters) {
            return this.odata("/PersonSet").get(parameters);
        }

    });

    return PersonService;
});