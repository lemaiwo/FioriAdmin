sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"be/wl/fio/FioriAdmin/model/models",
	"./state/AdminState",
	"./service/CatalogService"
], function (UIComponent, Device, models, AdminState, CatalogService) {
	"use strict";

	return UIComponent.extend("be.wl.fio.FioriAdmin.Component", {

		metadata: {
			manifest: "json"
		},
		ADMIN: "Admin",

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			this.getModel("builder").setSizeLimit(1000000);
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			CatalogService.setModel(this.getModel("builder"));
			this._oAdminState = new AdminState();
		},
		getState: function (sState) {
			return this["_o" + sState + "State"];
		}
	});
});