sap.ui.define([
    "./BaseService",
    "sap/ui/model/Sorter"
], function (CoreService) {
    "use strict";

    var OrderService = CoreService.extend("pro.dimensys.pm.logsheet.service.OrderService", {
        constructor: function (model) {
            CoreService.call(this, model);
        },

        getOrders: function (parameters) {
            return this.odata("/OrderSet").get(parameters);
        },

        getOrder: function (orderId) {
            var sPath = this.model.createKey("/OrderSet", {
                OrderId: orderId
            });
            return this.odata(sPath).get();
        }

    });

    return OrderService;
});