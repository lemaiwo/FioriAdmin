sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./TileType"
], function (ManagedObect, TileType) {
	"use strict";
	return ManagedObect.extend('be.elia.fio.FioriAdmin.model.Group', {
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
					type: 'be.elia.fio.FioriAdmin.model.Chip',
					multiple: true
				}
			}
		}
	});
});