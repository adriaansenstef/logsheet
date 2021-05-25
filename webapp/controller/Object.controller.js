/* globals moment */
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, formatter, UploadCollectionParameter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("pro.dimensys.pm.logsheet.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

			this.OrderState = this.getOwnerComponent()
				.getState(this.getOwnerComponent()
					.ORDER);
			this.setModel(this.OrderState.getModel(), "order");
			this.setModel(new JSONModel({ edit: false }), "viewModel");

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		onEditPress: function (oEvent) {
			this._toggleButtonsAndView(true);
			this._showFormFragment("ObjectChange");
		},

		onSavePress: function (oEvent) {
			if (this.OrderState.data.order.startDate < this.OrderState.data.order.finishDate) {
				if (this.hasConfirmationChanged) {
					this._getDialog("Executor").open();
				} else {
					this.OrderState.updateOrder().then(() => {
						this._getObjectData(this.OrderState.data.order.orderNumber);
					});
				}
			} else {
				// Invalid start/due date error message
			}
		},

		onCancelPress: function (oEvent) {
			this.byId("StartDateTimePicker").setValueState("None");
			this.byId("DueDateTimePicker").setValueState("None");

			this._getObjectData(this.OrderState.data.order.orderNumber);
		},

		onStatusButtonsPress: function (oEvent) {
			let newStatus = ' ';
			if (oEvent.getParameters().pressed) {
				switch (oEvent.getSource().getText()) {
					case this.getModel("i18n").getResourceBundle().getText("OperationTable.OK"):
						newStatus = 'E0002'
						break;
					case this.getModel("i18n").getResourceBundle().getText("OperationTable.NOK"):
						newStatus = 'E0003'
						break;
					case this.getModel("i18n").getResourceBundle().getText("OperationTable.NA"):
						newStatus = 'E0009'
						break;
					default:
						break;
				}
			}
			this.getModel("order").setProperty(oEvent.getSource().getParent().getBindingContextPath() + '/newStatus', newStatus);
			this.hasConfirmationChanged = (this.getModel("order").getProperty(oEvent.getSource().getParent().getBindingContextPath() + '/internalStatus') !== newStatus);
		},

		onDateChanged: function (oEvent) {
			if (this.OrderState.data.order.startDate >= this.OrderState.data.order.finishDate) {
				oEvent.getSource().setValueState("Error");
			} else {
				this.byId("StartDateTimePicker").setValueState("None");
				this.byId("DueDateTimePicker").setValueState("None");
			}
		},

		onSelectedPhaseChange: function (oEvent) {
			this.OrderState.data.order.phase = oEvent.getSource().getSelectedKey();
		},

		onSelectedUserStatusChange: function (oEvent) {
			this.OrderState.data.order.userStatus = oEvent.getSource().getSelectedKeys().toString();
		},

		onSelectedResponsiblePersonChange: function (oEvent) {
			if (!oEvent.getSource().getSelectedItem()) {
				oEvent.getSource().setSelectedItem(oEvent.getSource().getItemByKey("000000000000"))
			}
			this.OrderState.data.order.responsiblePerson = oEvent.getSource().getSelectedItem().getKey();

		},

		onTecoFlagPress: function (oEvent) {
			this._getDialog("TecoStatus").open();
		},

		onTecoFlagCancel: function (oEvent) {
			this._getDialog("TecoStatus").close();
			this.OrderState.data.order.referenceDate = ""
			this.OrderState.data.order.referenceTime = ""
		},

		onTecoFlagSave: function (oEvent) {
			this.OrderState.data.order.tecoFlag = true;
			this._getDialog("TecoStatus").close();
			this.onSavePress("event");
		},

		onRemoveTecoFlagPress: function (oEvent) {
			this._getDialog("RemoveTecoStatus").open();
		},

		onRemoveTecoFlagCancel: function (oEvent) {
			this._getDialog("RemoveTecoStatus").close();
		},

		onRemoveTecoFlagSave: function (oEvent) {
			this.OrderState.data.order.tecoFlag = false;
			this._getDialog("RemoveTecoStatus").close();
			this.onSavePress("event");
		},

		onEditRemarkPress: function (oEvent) {
			this._getDialog("Remark").open();
		},

		onRemarkClose: function (oEvent) {
			this._getDialog("Remark").close();
		},

		splitStatus: function (item) {
			if (item.includes(",")) {
				return item.split(",");
			}
			else {
				return item;
			}
		},

		iconTabFilterTextFormat: function (item) {
			let description = item.description;
			if (this.hasNOK(item)) {
				description = "! " + description;
			} return description;
		},

		iconTabFilterColorFormat: function (item) {
			if (this.hasNOK(item)) {
				return sap.ui.core.IconColor.Negative
			} else {
				return sap.ui.core.IconColor.Default
			}
		},

		highlightedOperationFormat: function (item) {
			if (item.internalStatus === 'E0003') {
				return 'Error'
			} else {
				return 'None'
			}
		},

		hasNOK: function (item) {
			return (item.operations.length > 0 && item.operations.filter(op => op.internalStatus === 'E0003').length > 0);
		},

		onExecutorDialogSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilter = [
				new Filter("FirstName", FilterOperator.Contains, sValue),
				new Filter("LastName", FilterOperator.Contains, sValue)
			];
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([aFilter]);
		},

		onExecutorDialogSelect: function (oEvent) {
			this.OrderState.data.order.executor = oEvent.getParameters().selectedContexts[0].getObject().personnelNumber;

			let updatedOrder = this.OrderState.data.order;

			// Add Quality Assurance user status if any operation has NOK status
			if (!updatedOrder.userStatus.includes(",QA")) {
				updatedOrder.phases.forEach(phase => {
					if (this.hasNOK(phase)) {
						updatedOrder.userStatus += ",QA"
					}
				});
			}
			this.OrderState.updateOrder().then(() => {
				this._getObjectData(updatedOrder.orderNumber);
			});
		},

		showMeasurePoints: function (oEvent) {
			this._getDialog("MeasurePoints").open();
			if (!this.OrderState.data.order.measurements || this.OrderState.data.order.measurements.length <= 0) {
				this.OrderState.getMeasurepoints(this.OrderState.data.order.technicalObject).then(this._getDialog("MeasurePoints").open());
			}
		},

		onMeasurePointClose: function (oEvent) {
			this._getDialog("MeasurePoints").close();
		},

		showAttachments: function (oEvent) {
			this._getDialog("Attachment").open();
			var oBinding = this.byId("UploadCollectionAttachment").getBindingInfo('items').binding;
			var aFilter = [
				new Filter("Ordernumber", FilterOperator.EQ, this.OrderState.data.order.orderNumber)
			];
			oBinding.filter(aFilter);
		},

		onAttachmentSave: function (oEvent) {
			var oUplCol = this.byId("UploadCollectionAttachment");

			var sKeyPath = "/AttachmentStreamSet";
			var sServiceURL = this.getOwnerComponent().getModel().sServiceUrl;
			var sUploadURL = sServiceURL + sKeyPath; // + "/AttachmentStream";
			for (var i = 0; i < oUplCol._aFileUploadersForPendingUpload.length; i++) {
				oUplCol._aFileUploadersForPendingUpload[i].setUploadUrl(sUploadURL);
			}

			oUplCol.upload();
			this._getDialog("Attachment").close();
		},

		onAttachmentCancel: function (oEvent) {
			this._getDialog("Attachment").close();
		},

		onAttachmentSelection: function (oEvent) {
			var key = this.getModel().createKey("AttachmentStreamSet", this.getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath()));
			var serviceURL = this.getModel().sServiceUrl;
			var fullUrl = [serviceURL, key, "$value"].join("/");
			window.open(fullUrl);
		},

		/* =========================================================== */
		/* Upload Collection methods                                   */
		/* =========================================================== */

		onAttachmentChange: function (oEvent) {
			var sSecurityToken = this.getView().getModel().getSecurityToken();
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: sSecurityToken
			});
			oEvent.getSource().addHeaderParameter(oCustomerHeaderToken);
		},

		onBeforeUploadStarts: function (oEvent) {
			// filename
			var sFilename = oEvent.getParameter("fileName");
			sFilename = encodeURIComponent(sFilename);
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: sFilename + "/" + this.OrderState.data.order.orderNumber
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				this._getObjectData(sObjectId)
			}.bind(this));
		},

		_getObjectData: function (sObjectId) {
			this.getModel("appView").setProperty("/busy", true)
			this.hasConfirmationChanged = false;
			this.OrderState.getOrder(sObjectId).then(() => {
				this._toggleButtonsAndView(false);
				this._showFormFragment("ObjectDisplay");
				this.OrderState.getPhases(sObjectId).then(() => {
					this.OrderState.getOperations(null).then(() => {
						var firstPhaseOperation = this.getModel("order").getData().order.phases.filter(ph => ph.operations.length > 0 && ph.operations[0].workCenter)[0];
						this.OrderState.getPersons(firstPhaseOperation ? firstPhaseOperation.operations[0].workCenter : null).finally(() => this.getModel("appView").setProperty("/busy", false));
					})
				});
			})
		},

		_formFragments: {},

		_showFormFragment: function (sFragmentName) {
			let oPage = this.byId("orderPage");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment("ObjectPhase"));
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		_getFormFragment: function (sFragmentName) {
			let oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}
			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "pro.dimensys.pm.logsheet.view.fragments." + sFragmentName, this);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		_toggleButtonsAndView: function (bEdit) {
			let oView = this.getView();
			this.getModel("viewModel").setProperty("/edit", bEdit);

			oView.byId("edit").setVisible(!bEdit);
			oView.byId("footer").setVisible(bEdit);
		},

		_getDialog: function (sDialogName) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this.getView().getId(), "pro.dimensys.pm.logsheet.view.fragments.dialogs." + sDialogName + "Dialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		}

	});

});