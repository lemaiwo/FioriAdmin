sap.ui.define([
	"../../BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("be.elia.fio.FioriAdmin.controller.dialog.CopyTo", {
		onBeforeShow: function (parent, fragment, callback, data) {
			this.parent = parent;
			this.fragment = fragment;
			this.callback = callback;
			this.fragment.data = data;
			this.fragment.setModel(new JSONModel(data), "copy");
			this.fragment.setModel(this.parent.getModel("admin"), "admin");
		},
		onCopy: function () {
			this.closeFragments();
			this.callback.call(this.parent);
		},
		handleCatalogValueHelp: function (oEvent) {
			this.parent.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.CatalogValuehelp", false, false, function (sDescription) {
				this.AdminState.setCopyToCatalog(sDescription);
			}, {
				search: oEvent.getSource().getValue()
			});
		},
		handleGroupValueHelp: function (oEvent) {
			this.parent.openFragment("be.elia.fio.FioriAdmin.view.admin.dialog.GroupValuehelp", false, false, function (sDescription) {
				this.AdminState.setAssignToGroup(sDescription);
			}, {
				search: oEvent.getSource().getValue()
			});
		},
		closeDialog: function () {
			this.fragment.close();
		}
	});

});