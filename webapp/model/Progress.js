sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./TileType"
], function (ManagedObect, TileType) {
	"use strict";
	return ManagedObect.extend('be.elia.fio.FioriAdmin.model.Progress', {
		metadata: {
			properties: {
				todo: "int",
				done: "int"
			}
		}
	});
});