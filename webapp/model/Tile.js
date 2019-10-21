sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./TileType"
], function (ManagedObect, TileType) {
	"use strict";
	return ManagedObect.extend('be.wl.fio.FioriAdmin.model.Tile', {
		metadata: {
			properties: {
				tileId: "string",
				name: "string",
				lastChanged: "date",
				semanticObject: "string",
				semanticAction: "string",
				target_url: "string",
				icon: "string",
				tileType: "be.wl.fio.FioriAdmin.model.TileType"
			}
		},
		setChipAsTileType: function (oChip) {
			this.setTileType(new TileType({
				tileTypeId: oChip.id,
				name: oChip.title
			}));
		},
		setConfig: function (sConfig) {
			var oConfig = this._convertConfigToJSON(sConfig);
			this.setSemanticObject(oConfig ? oConfig.navigation_semantic_object : "");
			this.setSemanticAction(oConfig ? oConfig.navigation_semantic_action : "");
			this.setTarget_url(oConfig ? oConfig.navigation_target_url : "");
			this.setIcon(oConfig ? oConfig.display_icon_url : "");
		},
		_convertConfigToJSON: function (sConfig) {
			try {
				return JSON.parse(JSON.parse(sConfig).tileConfiguration);
			} catch (ex) {
				return false;
			}
		}
	});
});