sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./TileType"
], function (ManagedObect, TileType) {
	"use strict";
	return ManagedObect.extend('be.wl.fio.FioriAdmin.model.Group', {
		metadata: {
			properties: {
				instanceId: "string",
				groupId: "string",
				name: "string",
				catalogId: "string",
				chipId: "string",
				scope: "string",
				layout: "string"
			},
			aggregations: {
				chips: {
					type: 'be.wl.fio.FioriAdmin.model.Chip',
					multiple: true
				}
			}
		}
	});
});