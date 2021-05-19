sap.ui.define([
    "./BaseObject"
], function (BaseObject) {
    "use strict";
    return BaseObject.extend("pro.dimensys.pm.logsheet.model.Person", {
        constructor: function (data) {
            BaseObject.call(this, data);
        },

        getJSON: function () {
            return {

            }
        }
    });
});