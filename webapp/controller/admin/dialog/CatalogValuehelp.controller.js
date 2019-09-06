sap.ui.define([
	"../../BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("be.elia.fio.FioriAdmin.controller.dialog.CatalogValuehelp", {
		onBeforeShow: function (parent, fragment, callback, data) {
			this.parent = parent;
			this.fragment = fragment;
			this.callback = callback;
			this.fragment.data = data;
			this.fragment.setModel(this.parent.getModel("builder"), "builder");
			this._searchList(data.search);
		},
		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			this._searchList(sValue);
		},
		_searchList: function (sValue) {
			var oFilter = new Filter(
				"domainId",
				FilterOperator.Contains, sValue
			);
			this.fragment.getBinding("items").filter([oFilter]);
		},
		confirmDialog: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				this.callback.call(this.parent, oSelectedItem.getDescription());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		closeDialog: function (evt) {
			evt.getSource().getBinding("items").filter([]);
			this.fragment.close();
		}
	});

});