/*!
 * ${copyright}
 */

// Provides control pro.dimensys.lib.zdim_ui5_lib.
sap.ui.define([
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/List',
    'sap/m/SearchField',
    'sap/m/library',
    'sap/ui/core/Control',
    'sap/ui/Device',
    'sap/m/Toolbar',
    'sap/m/Label',
    'sap/m/BusyIndicator',
    'sap/m/Bar',
    'sap/m/Title',
    'sap/ui/core/theming/Parameters',
    "sap/base/Log",
    "sap/m/Tree",
    "sap/m/SelectDialog"
],
    function (
        Button,
        Dialog,
        List,
        SearchField,
        library,
        Control,
        Device,
        Toolbar,
        Label,
        BusyIndicator,
        Bar,
        Title,
        Parameters,
        Log,
        Tree,
        SelectDialog
    ) {
        "use strict";

        /**
         * Constructor for a new InfoButton Control.
         *
         * @param {string} [sId] id for the new control, generated automatically if no id is given
         * @param {object} [mSettings] initial settings for the new control
         *
         * @class
         * Some class description goes here.
         * @extends  Control
         *
         * @author SAP SE
         * @version 1.0.0
         *
         * @constructor
         * @public
         * @alias pro.dimensys.lib.zdim_ui5_lib.controls.InfoButton
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var TreeSelectDialog = SelectDialog.extend("pro.dimensys.pm.logsheet.controls.TreeSelectDialog", {
            metadata: {
                library: "pro.dimensys.pm.logsheet",
                events: {

                    /**
                     * This event will be fired when the dialog is confirmed by selecting an item in single selection mode or by pressing the confirmation button in multi selection mode . The items being selected are returned as event parameters.
                     */
                    confirm: {
                        parameters: {

                            /**
                             * Returns the selected list item. When no item is selected, "null" is returned. When multi-selection is enabled and multiple items are selected, only the first selected item is returned.
                             */
                            selectedItem: {
                                type: "sap.m.StandardTreeItem"
                            },

                            /**
                             * Returns an array containing the visible selected list items. If no items are selected, an empty array is returned.
                             */
                            selectedItems: {
                                type: "sap.m.StandardTreeItem[]"
                            },

                            /**
                             * Returns the binding contexts of the selected items including the non-visible items, but excluding the not loaded items. See {@link sap.m.ListBase#getSelectedContexts getSelectedContexts} of <code>sap.m.ListBase</code>.
                             * NOTE: In contrast to the parameter "selectedItems", this parameter will also include the selected but NOT visible items (e.g. due to list filtering). An empty array will be set for this parameter if no data binding is used.
                             * NOTE: When the list binding is pre-filtered and there are items in the selection that are not visible upon opening the dialog, these contexts are not loaded. Therefore, these items will not be included in the selectedContexts array unless they are displayed at least once.
                             */
                            selectedContexts: {
                                type: "object[]"
                            }
                        }
                    },

                    /**
                     * This event will be fired when the search button has been clicked on the searchfield on the visual control
                     */
                    search: {
                        parameters: {

                            /**
                             * The value entered in the search
                             */
                            value: {
                                type: "string"
                            },

                            /**
                             * The Items binding of the Select Dialog for search purposes. It will only be available if the items aggregation is bound to a model.
                             */
                            itemsBinding: {
                                type: "any"
                            },

                            /**
                             * Returns if the Clear button is pressed.
                             * @since 1.70
                             */

                            clearButtonPressed: {
                                type: "boolean"
                            }
                        }
                    },

                    /**
                     * This event will be fired when the value of the search field is changed by a user - e.g. at each key press
                     */
                    liveChange: {
                        parameters: {

                            /**
                             * The value to search for, which can change at any keypress
                             */
                            value: {
                                type: "string"
                            },

                            /**
                             * The Items binding of the Select Dialog. It will only be available if the items aggregation is bound to a model.
                             */
                            itemsBinding: {
                                type: "any"
                            }
                        }
                    }
                }
            }
        });
        TreeSelectDialog.prototype.init = function () {
            var that = this,
                iLiveChangeTimer = 0;

            this._bAppendedToUIArea = false;
            this._bInitBusy = false;
            this._bFirstRender = true;
            this._bAfterCloseAttached = false;
            this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

            // store a reference to the list for binding management
            this._oList = new Tree(this.getId() + "-list", {
                growing: that.getGrowing(),
                growingScrollToLoad: that.getGrowing(),
                mode: sap.m.ListMode.MultiSelect,
                sticky: [library.Sticky.InfoToolbar],
                infoToolbar: new Toolbar({
                    visible: false,
                    active: false,
                    content: [
                        new Label({
                            text: this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS", [0])
                        })
                    ]
                }),
                selectionChange: this._selectionChange.bind(this)
            });

            this._oList.getInfoToolbar().addEventDelegate({
                onAfterRendering: function () {
                    that._oList.getInfoToolbar().$().attr('aria-live', 'polite');
                }
            });

            this._list = this._oList; // for downward compatibility

            // attach events to listen to model updates and show/hide a busy indicator
            this._oList.attachUpdateStarted(this._updateStarted, this);
            this._oList.attachUpdateFinished(this._updateFinished, this);

            // store a reference to the busyIndicator to display when data is currently loaded by a service
            this._oBusyIndicator = new BusyIndicator(this.getId() + "-busyIndicator").addStyleClass("sapMSelectDialogBusyIndicator", true);

            // store a reference to the searchField for filtering
            // store a reference to the searchField for filtering
            this._oSearchField = new SearchField(this.getId() + "-searchField", {
                width: "100%",
                liveChange: function (oEvent) {
                    var sValue = oEvent.getSource().getValue(),
                        iDelay = (sValue ? 300 : 0); // no delay if value is empty

                    // execute search after user stops typing for 300ms
                    clearTimeout(iLiveChangeTimer);
                    if (iDelay) {
                        iLiveChangeTimer = setTimeout(function () {
                            that._executeSearch(sValue, false, "liveChange");
                        }, iDelay);
                    } else {
                        that._executeSearch(sValue, false, "liveChange");
                    }
                },
                // execute the standard search
                search: function (oEvent) {
                    var sValue = oEvent.getSource().getValue(),
                        bClearButtonPressed = oEvent.getParameters().clearButtonPressed;

                    that._executeSearch(sValue, bClearButtonPressed, "search");
                }
            });
            this._searchField = this._oSearchField; // for downward compatibility

            // store a reference to the subheader for hiding it when data loads
            this._oSubHeader = new Bar(this.getId() + "-subHeader", {
                contentMiddle: [
                    this._oSearchField
                ]
            });

            //store a reference to the dialog header
            var oCustomHeader = new Bar(this.getId() + "-dialog-header", {
                // titleAlignment: that.getTitleAlignment(),
                contentMiddle: [
                    new Title(this.getId() + "-dialog-title", {
                        level: "H2"
                    })
                ]
            });

            // store a reference to the internal dialog
            this._oDialog = new Dialog(this.getId() + "-dialog", {
                customHeader: oCustomHeader,
                // titleAlignment: that.getTitleAlignment(),
                stretch: Device.system.phone,
                contentHeight: "2000px",
                subHeader: that._oSubHeader,
                content: [that._oBusyIndicator, that._oList],
                leftButton: that._getCancelButton(),
                initialFocus: (Device.system.desktop ? that._oSearchField : null),
                // draggable: that.getDraggable() && Device.system.desktop,
                // resizable: that.getResizable() && Device.system.desktop,
                escapeHandler: function (oPromiseWrapper) {
                    //CSN# 3863876/2013: ESC key should also cancel dialog, not only close it
                    that._onCancel();
                    oPromiseWrapper.resolve();
                }
            }).addStyleClass("sapMSelectDialog");

            this._oDialog.addAriaLabelledBy(this._oList.getInfoToolbar());

            // for downward compatibility reasons
            this._dialog = this._oDialog;
            this.setAggregation("_dialog", this._oDialog);

            // internally set top and bottom margin of the dialog to 4rem respectively
            // CSN# 333642/2014: in base theme the parameter sapUiFontSize is "medium", implement a fallback
            this._oDialog._iVMargin = 8 * (parseInt(Parameters.get("sapUiFontSize")) || 16); // 128

            // helper variables for search update behaviour
            this._sSearchFieldValue = "";

            // flags to control the busy indicator behaviour because the growing list will always show the no data text when updating
            this._bFirstRequest = true; // to only show the busy indicator for the first request when the dialog has been openend
            this._bLiveChange = false; // to check if the triggered event is LiveChange
            this._iListUpdateRequested = 0; // to only show the busy indicator when we initiated the change
        };

        TreeSelectDialog.prototype._selectionChange = function () {
            if (!this._oDialog) {
                return;
            }

            // The following logic handles the item tap / select when:
            // -- the selectDialog is in multi select mode - only update the indicator
            if (this.getMultiSelect()) {
                this._updateSelectionIndicator();
                return; // the SelectDialog should remain open
            }
            // -- the selectDialog in single select mode - close and update the selection of the dialog
            if (!this._bAfterCloseAttached) {
                // if the resetAfterclose function is not attached already
                // attach it to afterClose to hide the dialog changes from the end user
                this._oDialog.attachEventOnce("afterClose", this._resetAfterClose, this);
                this._bAfterCloseAttached = true;
            }
            if (this._oList.getSelectedItem()) {
                this._oDialog.close();
            }
        };

        TreeSelectDialog.prototype._executeSearch = function (sValue, bClearButtonPressed, sEventType) {

            var oList = this._oList,
                oBinding = (oList ? oList.getBinding("items") : undefined),
                bSearchValueDifferent = (this._sSearchFieldValue !== sValue); // to prevent unwanted duplicate requests

            // BCP #1472004019/2015: focus after liveChange event is not changed
            if (sEventType === "liveChange") {
                this._bLiveChange = true;
            }

            // fire either the Search event or the liveChange event when dialog is opened.
            // 1) when the clear icon is called then both liveChange and search events are fired but we only want to process the first one
            // 2) when a livechange has been triggered by typing we don't want the next search event to be processed (typing + enter or typing + search button)
            if (this._oDialog.isOpen()) {
                // set the internal value to the passed value to check if the same value has already been filtered (happens when clear is called, it fires liveChange and change events)
                this._sSearchFieldValue = sValue;

                // only set when the binding has already been executed
                if (oBinding) {
                    // we made another request in this control, so we update the counter
                    this._iListUpdateRequested += 1;
                    if (sEventType === "search") {
                        // fire the search so the data can be updated externally
                        this.fireSearch({
                            value: sValue,
                            itemsBinding: oBinding,
                            clearButtonPressed: bClearButtonPressed
                        });
                    } else if (sEventType === "liveChange") {
                        // fire the liveChange so the data can be updated externally
                        this.fireLiveChange({
                            value: sValue,
                            itemsBinding: oBinding
                        });
                    }
                } else {
                    // no binding, just fire the event for manual filtering
                    if (sEventType === "search") {
                        // fire the search so the data can be updated externally
                        this.fireSearch({
                            value: sValue,
                            clearButtonPressed: bClearButtonPressed
                        });
                    } else if (sEventType === "liveChange") {
                        // fire the liveChange so the data can be updated externally
                        this.fireLiveChange({
                            value: sValue
                        });
                    }
                }
            }

            return this;
        };

        return TreeSelectDialog;

    }, /* bExport= */ true);