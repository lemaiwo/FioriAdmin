sap.ui.define([
	"../../BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("be.elia.fio.FioriAdmin.controller.dialog.CopyProgress", {
		onBeforeShow: function (parent, fragment, callback, data) {
			this.parent = parent;
			this.fragment = fragment;
			this.callback = callback;
			this.fragment.data = data;
			this.fragment.setModel(this.parent.getModel("admin"), "admin");
		},
		closeDialog: function () {
			this.closeFragments();
		}
	});

});