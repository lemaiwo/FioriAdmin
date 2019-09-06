sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./TileType"
], function (ManagedObect, TileType) {
	"use strict";
	return ManagedObect.extend('be.elia.fio.FioriAdmin.model.Chip', {
		metadata: {
			properties: {
				isSelected: {
					type: "boolean",
					defaultValue: false
				},
				tileId: "string",
				instanceId: "string",
				name: "string",
				lastChanged: "object",
				semanticObject: "string",
				semanticAction: "string",
				targetUrl: "string",
				icon: "string",
				tileType: "be.elia.fio.FioriAdmin.model.TileType",
				displayInfoText: "string",
				displayTitleText: "string",
				navigationProvider: "string",
				navigationProviderRole: "string",
				navigationProviderInstance: "string",
				targetApplicationAlias: "string",
				targetApplicationId: "string",
				targetSystemAlias: "string",
				transactionCode: "string",
				ui5Component: "string",
				url: "string",
				webDynproApp: "string",
				webDynproConf: "string",
				status: {
					type: "string",
					defaultValue: "None"
				},
				statusMsg: "string"
			},
			aggregations: {
				catalogs: {
					type: 'be.elia.fio.FioriAdmin.model.Page',
					multiple: true
				},
				groups: {
					type: 'be.elia.fio.FioriAdmin.model.Page',
					multiple: true
				}
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
			if (!this.getName()) {
				this.setName(this.getTitleFromConfig(sConfig));
			}
			this.setSemanticObject(oConfig && oConfig.navigation_semantic_object ? oConfig.navigation_semantic_object :
				oConfig && oConfig.semantic_object ? oConfig.semantic_object : oConfig && oConfig.semanticObject ? oConfig.semanticObject : "");
			this.setSemanticAction(oConfig && oConfig.navigation_semantic_action ? oConfig.navigation_semantic_action :
				oConfig && oConfig.semantic_action ? oConfig.semantic_action : oConfig && oConfig.semanticAction ? oConfig.semanticAction : "");
			this.setTargetUrl(oConfig && oConfig.navigation_target_url ? oConfig.navigation_target_url : "");
			this.setIcon(oConfig && oConfig.display_icon_url ? oConfig.display_icon_url : "");
			this.setDisplayInfoText(oConfig && oConfig.display_info_text ? oConfig.display_info_text : "");
			this.setDisplayTitleText(oConfig && oConfig.display_title_text ? oConfig.display_title_text : "");
			this.setNavigationProvider(oConfig && oConfig.navigation_provider ? oConfig.navigation_provider : "");
			this.setNavigationProviderRole(oConfig && oConfig.navigation_provider_instance ? oConfig.navigation_provider_instance : "");
			this.setNavigationProviderInstance(oConfig && oConfig.navigation_provider_role ? oConfig.navigation_provider_role : "");
			this.setTargetApplicationAlias(oConfig && oConfig.target_application_alias ? oConfig.target_application_alias : "");
			this.setTargetApplicationId(oConfig && oConfig.target_application_id ? oConfig.target_application_id : "");
			this.setTargetSystemAlias(oConfig && oConfig.target_system_alias ? oConfig.target_system_alias : "");
			this.setTransactionCode(oConfig && oConfig.transaction && oConfig.transaction.code ? oConfig.transaction.code : "");
			this.setUi5Component(oConfig && oConfig.ui5_component ? oConfig.ui5_component : "");
			this.setUrl(oConfig && oConfig.url ? oConfig.url : "");
			this.setWebDynproApp(oConfig && oConfig.web_dynpro && oConfig.web_dynpro.application ? oConfig.web_dynpro.application : "");
			this.setWebDynproConf(oConfig && oConfig.web_dynpro && oConfig.web_dynpro.configuration ? oConfig.web_dynpro.configuration : "");
		},
		getTitleFromConfig: function (sConfig) {
			try {
				var oTileConfig = JSON.parse(JSON.parse(sConfig).tileConfiguration);
				if (oTileConfig["EVALUATION"]) {
					return JSON.parse(oTileConfig.EVALUATION).TITLE;
				}
				return oTileConfig.display_title_text;
			} catch (ex) {
				return "";
			}
		},
		_convertConfigToJSON: function (sConfig) {
			try {
				var oTileConfig = JSON.parse(JSON.parse(sConfig).tileConfiguration);
				if (oTileConfig["TILE_PROPERTIES"]) {
					return JSON.parse(oTileConfig.TILE_PROPERTIES);
				}
				return oTileConfig;
			} catch (ex) {
				return false;
			}
		}
	});
});