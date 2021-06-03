sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Input",
    "pro/dimensys/pm/logsheet/controls/TreeSelectDialog",
    "sap/m/Tree",
    "sap/m/CustomTreeItem",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/m/Button",
    "sap/m/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/m/Bar",
    "sap/m/Title"
], function (Control, Input, TreeSelectDialog, Tree, CustomTreeItem, MessageToast, Device, Button, BusyIndicator, Filter, Bar, Title) {
    "use strict";

    return Input.extend("pro.dimensys.pm.logsheet.controls.FuncLocSearchHelp", {

        metadata: {
            properties: {
                value: {
                    type: "string",
                    defaultValue: ""
                },
                text: {
                    type: "string",
                    defaultValue: ""
                },
                showValueHelp: {
                    type: "boolean",
                    defaultValue: true
                },
                valueHelpOnly: {
                    type: "boolean",
                    defaultValue: false
                }
            },
            aggregations: {},
            events: {
                "onSelect": {
                    allowPreventDefault: true,
                    parameters: {
                        "object": {
                            type: "object"
                        },
                        "objectdescription": {
                            type: "string"
                        },
                        "objecttype": {
                            type: "string"
                        }
                    }
                }
            },
            renderer: null
        },

        init: function () {
            Input.prototype.init.call(this);

            this.attachValueHelpRequest(this.onValueHelpRequest);
            this.attachOnSelect(this.onSelect);
        },

        renderer: function (oRm, oInput) {
            sap.m.InputRenderer.render(oRm, oInput);
        },

        onValueHelpRequest: function (oEvent) {
            // function name speaks for itself
            var that = this;

            let oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDIM_CREATE_NOTIF_GW_SRV/");
            // oModel.read("/TechnicalObjectShSet", {
            // 	success: function (oSuccess) {
            that.setModel(oModel, "tobj");

            var oTemplate = new sap.m.CustomTreeItem({
                content: [
                    new sap.m.Label({
                        text: "{Object} ",
                        design: "Bold"
                    }),
                    new sap.m.Label({
                        text: " - {Description}"
                    })
                ]
            });

            var oDialog = new TreeSelectDialog({
                title: "Select technical object",
                multiSelect: true,
                confirm: function (oConfirmEvent) {
                    that.closeDialogFuncLocItems(oConfirmEvent);
                },
                cancel: function (oCancelEvent) {
                    that.closeDialogFuncLocItems(oCancelEvent);
                },
                search: function (oEvt) {
                    var sValue = oEvt.getParameter("value");
                    var oTemplate = new sap.m.CustomTreeItem({
                        content: [
                            new sap.m.Label({
                                text: "{Object} ",
                                design: "Bold"
                            }),
                            new sap.m.Label({
                                text: " - {Description}"
                            })
                        ]
                    });

                    if (!sValue || sValue === "") {
                        this._oList.bindItems({
                            path: "/TechnicalObjectShSet",
                            template: oTemplate,
                            parameters: {
                                operationMode: "Client",
                                useServersideApplicationFilters: true,
                                numberOfExpandedLevels: 1,
                                treeAnnotationProperties: {
                                    hierarchyLevelFor: "Hierarchylevel",
                                    hierarchyNodeFor: "Object",
                                    hierarchyParentNodeFor: "Superiorobject",
                                    hierarchyDrillStateFor: "Drillstate"
                                }
                            }
                        });
                    } else {
                        var filter = new Filter("Object", sap.ui.model.FilterOperator.Contains, sValue);

                        this._oList.bindItems({
                            path: "/TechnicalObjectShSet",
                            filters: [filter],
                            template: oTemplate,
                            parameters: {
                                operationMode: "Client",
                                useServersideApplicationFilters: true,
                                numberOfExpandedLevels: 1,
                                treeAnnotationProperties: {
                                    hierarchyLevelFor: "Hierarchylevel",
                                    hierarchyNodeFor: "Object",
                                    hierarchyParentNodeFor: "Superiorobject",
                                    hierarchyDrillStateFor: "Drillstate"
                                }
                            }
                        });

                    }
                }
            });

            oDialog.setModel(that.getModel("tobj"));
            oDialog.bindAggregation("items", {
                path: "/TechnicalObjectShSet",
                template: oTemplate,
                parameters: {
                    operationMode: "Client",
                    useServersideApplicationFilters: true,
                    numberOfExpandedLevels: 1,
                    treeAnnotationProperties: {
                        hierarchyLevelFor: "Hierarchylevel",
                        hierarchyNodeFor: "Object",
                        hierarchyParentNodeFor: "Superiorobject",
                        hierarchyDrillStateFor: "Drillstate"
                    }
                }
            });
            oDialog.open();

            // 	},
            // 	error: function (oError) {}
            // });

        },

        closeDialogFuncLocItems: function (oEvent) {
            var oDialog = oEvent.getSource();
            oDialog.destroyItems();
            oDialog.destroy();

            if (oEvent.getParameter("selectedItems") /*&& oEvent.getParameter("selectedItems").getBindingContext()*/) {
                var aObj = oEvent.getParameter("selectedItems").map(a => a.getBindingContext().getObject());
                // save select dialog object in control properties

                this.setValue(aObj.map(a => a.Object))
                this.setText(aObj.map(a => a.Description));
                let aObjSelect = [];
                aObj.forEach((obj) => {
                    aObjSelect.push({
                        "object": obj.Object,
                        "objectdescription": obj.Description,
                        "objecttype": obj.Type
                    })
                })
                // fire event to notify view of selection
                this.fireOnSelect(aObjSelect);
            }

            // Single select

            //if (oEvent.getParameter("selectedItem") && oEvent.getParameter("selectedItem").getBindingContext()) {
            //    var obj = oEvent.getParameter("selectedItem").getBindingContext().getObject();
            //    // save select dialog object in control properties
            //
            //    this.setValue(obj.Object);
            //    this.setText(obj.Description);
            //    // fire event to notify view of selection
            //    this.fireOnSelect({
            //        "object": obj.Object,
            //        "objectdescription": obj.Description,
            //        "objecttype": obj.Type
            //    });
        },

        onSelect: function (oEvent) {

        },

        _selectionChange: function (oEvent) {

        },

        _getCancelButton: function () {
            var that = this;

            if (!this._oCancelButton) {
                this._oCancelButton = new Button(this.getId() + "-cancel", {
                    text: this._oRb.getText("MSGBOX_CANCEL"),
                    press: function (oEvent) {
                        that._onCancel();
                    }
                });
            }
            return this._oCancelButton;
        },

        _onCancel: function (oEvent) {
            var that = this;

            // attach the reset function to afterClose to hide the dialog changes from the end user
            this._oDialog.attachAfterClose(
                function () {
                    // reset internal selection values
                    that._oSelectedItem = null;
                    that._aSelectedItems = [];
                    that._sSearchFieldValue = null;

                    // detach this function
                    that._oDialog.detachAfterClose(fnAfterClose);

                    // reset selection to the previous selection
                    // CSN# 1166619/2014: selections need to be restored before the cancel event is fired because the filter is usually reset in the cancel event
                    that._resetSelection();

                    // fire cancel event
                    that.fireCancel();
                }
            );
            this._oDialog.close();
        }

    });
});