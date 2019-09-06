sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObect) {
	"use strict";
	return ManagedObect.extend('be.elia.fio.FioriAdmin.model.TileType', {
		metadata: {
			properties: {
				tileTypeId: "string",
				name: "string",
				isTile: "boolean"
			}
		},
		setTileTypeId: function (sValue) {
			this.setProperty("tileTypeId", sValue);
			this.setIsTile(true);
			if (sValue.indexOf("ACTION") > -1) {
				this.setIsTile(false);
			}
		}
	});
});