sap.ui.define([
    "./BaseService"
], function (CoreService) {
    "use strict";

    var UserService = CoreService.extend("pro.dimensys.pm.logsheet.service.UserService", {
        constructor: function (model) {
            CoreService.call(this, model);
        },

        getUser: function () {
            return this.odata("/UserSet").get();
        }

    });

    return UserService;
});