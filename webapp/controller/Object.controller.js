/* globals moment */
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/m/UploadCollectionParameter"
], function (BaseController, JSONModel, History, formatter, UploadCollectionParameter) {
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
				this._getExecutorDialog().open();
			} else {
				// Invalid start/due date error message
			}
		},

		onCancelPress: function (oEvent) {
			this.getView().setBusy(true);
			this._toggleButtonsAndView(false);
			this._showFormFragment("ObjectDisplay");

			this.byId("StartDateTimePicker").setValueState("None");
			this.byId("DueDateTimePicker").setValueState("None");

			this.OrderState.getOrder(this.OrderState.data.order.orderNumber).then((order) => {
				this.OrderState.getPhases(this.OrderState.data.order.orderNumber).then(() => {
					var phases = this.getModel("order").getData().order.phases;
					this.OrderState.getOperations(phases.length > 0 ? phases[0].phaseId : null).finally(() => {

						this.getView().setBusy(false);
					})
				})
			});
		},

		onOkPress: function (oEvent) {
			this.getModel("order").setProperty(oEvent.getSource().getParent().getBindingContextPath() + '/newStatus', 'E0002');
		},

		onNokPress: function (oEvent) {
			this.getModel("order").setProperty(oEvent.getSource().getParent().getBindingContextPath() + '/newStatus', 'E0003');
		},

		onNvtPress: function (oEvent) {
			this.getModel("order").setProperty(oEvent.getSource().getParent().getBindingContextPath() + '/newStatus', 'E0009');
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
			this.OrderState.data.order.userStatus = oEvent.getSource().getSelectedKeys();
		},

		onSelectedResponsiblePersonChange: function (oEvent) {
			var key = oEvent.getSource().getSelectedItem();

			if (!key) {
				oEvent.getSource().setValueState("Error");
			} else {
				oEvent.getSource().setValueState("None");
				this.OrderState.data.order.responsiblePerson = key;
			}
		},

		onTecoFlagPress: function (oEvent) {
			this._getTecoChangeDialog().open();
		},

		onTecoFlagCancel: function (oEvent) {
			this._getTecoChangeDialog().close();
			this.OrderState.data.order.referenceDate = ""
			this.OrderState.data.order.referenceTime = ""
		},

		onTecoFlagSave: function (oEvent) {
			this.OrderState.data.order.systemStatus = "TECO";
			this.OrderState.data.order.systemStatusTechnical = "I0045";
			this._getTecoChangeDialog().close();
			this.onSavePress("event");
		},

		splitStatus: function (item) {
			if (item.includes(",")) {
				return item.split(",");
			}
			else {
				return item;
			}
		},

		onPhaseSelect: function (oEvent) {
			var sKey = oEvent.getParameter("key");
			this.getModel("appView").setProperty("/busy", true);
			this.OrderState.getOperations(sKey).then(() => {
				this.getModel("appView").setProperty("/busy", false);
			});
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
			this.OrderState.data.order.executor = this.getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()).PersonnelNumber;
			this.getView().setBusy(true);
			this._toggleButtonsAndView(false);
			this._showFormFragment("ObjectDisplay");
			let updatedOrder = this.OrderState.data.order;
			this.OrderState.updateOrder().then(() => {
				this.OrderState.getOrder(updatedOrder.orderNumber).then((order) => {
					this.OrderState.getPhases(updatedOrder.orderNumber).then(() => {
						var phases = this.getModel("order").getData().order.phases;
						this.OrderState.getOperations(phases.length > 0 ? phases[0].phaseId : null).finally(() => {
							this.getView().setBusy(false);
						})
					})
				})
			});
			this._getExecutorDialog().close();
		},

		onExecutorDialogClose: function (oEvent) {
			this._getExecutorDialog().close();
		},

		showAttachments: function (oEvent) {
			this._getAttachmentDialog().open();
		},

		onAttachmentSave: function (oEvent) {
			var oUplCol = this.byId("UploadCollectionAttachment");

			var sKeyPath = "/AttachmentStream";
			var sServiceURL = this.getOwnerComponent().getModel().sServiceUrl;
			var sUploadURL = sServiceURL + sKeyPath; // + "/AttachmentStream";
			for (var i = 0; i < oUplCol._aFileUploadersForPendingUpload.length; i++) {
				oUplCol._aFileUploadersForPendingUpload[i].setUploadUrl(sUploadURL);
			}

			oUplCol.upload();
			this._getAttachmentDialog().close();
		},

		onAttachmentCancel: function (oEvent) {
			this._getAttachmentDialog().close();
		},

		onAttachmentSelection: function(oEvent){
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
				this.getModel("appView").setProperty("/busy", true);
				this.OrderState.getOrder(sObjectId).then((order) => {
					this._toggleButtonsAndView(false);
					this._showFormFragment("ObjectDisplay");
					this.OrderState.getPhases(sObjectId).then(() => {
						var phases = this.getModel("order").getData().order.phases;
						this.OrderState.getOperations(phases.length > 0 ? phases[0].phaseId : null).then(() => {
							this.getModel("appView").setProperty("/busy", false);
						}).catch(() => this.getModel("appView").setProperty("/busy", false));
					});
				});
			}.bind(this));
			this.getModel("appView").setProperty("/busy", false);
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

		_getTecoChangeDialog: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this.getView().getId(), "pro.dimensys.pm.logsheet.view.fragments.dialogs.TecoStatus", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		_getExecutorDialog: function () {
			if (!this._oExecutorDialog) {
				this._oExecutorDialog = sap.ui.xmlfragment(this.getView().getId(), "pro.dimensys.pm.logsheet.view.fragments.dialogs.ExecutorDialog", this);
				this.getView().addDependent(this._oExecutorDialog);
			}
			return this._oExecutorDialog;
		},

		_getAttachmentDialog: function () {
			if (!this._oAttaDialog) {
				this._oAttaDialog = sap.ui.xmlfragment(this.getView().getId(), "pro.dimensys.pm.logsheet.view.fragments.dialogs.AttachmentDialog", this);
				this.getView().addDependent(this._oAttaDialog);
			}
			return this._oAttaDialog;
		}

	});

});