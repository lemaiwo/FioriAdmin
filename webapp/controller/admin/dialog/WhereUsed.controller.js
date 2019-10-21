sap.ui.define([
	"../../BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("be.wl.fio.FioriAdmin.controller.dialog.WhereUsed", {
		onBeforeShow: function (parent, fragment, callback, data) {
			this.parent = parent;
			this.fragment = fragment;
			this.callback = callback;
			this.fragment.data = data;
			this.fragment.setModel(this.parent.getModel("admin"), "admin");
		},
		closeDialog: function () {
			this.fragment.close();
		}
	});

});