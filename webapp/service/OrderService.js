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

        getOrder: function (orderNumber) {
            var sPath = this.model.createKey("/DetailSet", {
                OrderNumber: orderNumber
            });
            return this.odata(sPath).get();
        },

        updateOrder: function (order) {
            var sPath = this.model.createKey("/DetailSet", {
                OrderNumber: order.orderNumber
            });

            var json = order.getJSON();

            return this.odata(sPath).put(json);
        },

    });

    return OrderService;
});