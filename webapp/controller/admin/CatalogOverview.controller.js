sap.ui.define([
	"../BaseController",
	"sap/m/MessageToast",
	"sap/base/strings/capitalize"
], function (Controller, MessageToast, capitalize) {
	"use strict";

	return Controller.extend("be.elia.fio.FioriAdmin.controller.admin.CatalogOverview", {
		onInit: function () {
			this.AdminState = this.getOwnerComponent().getState(this.getOwnerComponent().ADMIN);
			this.getView().setModel(this.AdminState.getModel(), "admin");
		},
		getPage: function (oEvent) {
			this.AdminState.loadCatalog().catch(function () {
				MessageToast.show(this.AdminState.getPageTypeText() + " " + this.AdminState.getCurrentPageName() + " not found!");
			}.bind(this));
		},
		onTableSelectionChanged: function (oEvent) {
			if (oEvent.getParameter("selectAll")) {
				this.AdminState.getPage().setSelectForAllChips(true);
			} else if (oEvent.getParameter("rowContext")) {
				var oChip = oEvent.getParameter("rowContext").getObject();
				oChip.setIsSelected(!oChip.getIsSelected());
			} else {
				this.AdminState.getPage().setSelectForAllChips(false);
			}
		},
		onFilter: function (oEvent) {
			this.AdminState.getPage().setSelectForAllChips(false);
		},
		handleCatalogValueHelp: function (oEvent) {
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.CatalogValuehelp", false, false, function (sDescription) {
				this.AdminState.setCatalogName(sDescription);
			}, {
				search: oEvent.getSource().getValue()
			});
		},
		handleGroupValueHelp: function (oEvent) {
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.GroupValuehelp", false, false, function (sDescription) {
				this.AdminState.setGroupName(sDescription);
			}, {
				search: oEvent.getSource().getValue()
			});
		},
		onStartAssign: function (oEvent) {
			if (this.AdminState.getPage().hasSelectionTargetMapping()) {
				MessageToast.show("You can only assign tiles!");
				return false;
			}
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.CopyTo", false, false, this.onAssign, {
				type: "GROUP"
			});
		},
		onAssign: function () {
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.CopyProgress");
			this.AdminState.assignToGroup().then(function () {
				this.byId("table").clearSelection();
				MessageToast.show("Finished assigning tiles to group!");
			}.bind(this)).catch(function (oError) {
				MessageToast.show(this.getResourceBundle().getText(oError.id));
			}.bind(this));
		},
		onStartCopy: function (oEvent) {
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.CopyTo", false, false, this.onCopy, {
				type: "CATALOG"
			});
		},
		onCopy: function () {
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.CopyProgress");
			this.AdminState.createReference().then(function () {
				this.byId("table").clearSelection();
				MessageToast.show("Finished creating references!");
			}.bind(this));
		},
		onWhereUsed: function () {
			this.AdminState.getWhereUsed().then(function () {
				this.byId("table").clearSelection();
			}.bind(this));
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.WhereUsed");
		},
		onDelete: function () {
			this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.CopyProgress");
			this.AdminState.deleteChips().then(function () {
				this.byId("table").clearSelection();
			}.bind(this)).catch(function () {
				this.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.WhereUsed");
			}.bind(this));
		}
	});
});