sap.ui.define([
	"sap/ui/base/ManagedObject",
	"./Chip"
], function (ManagedObect, Chip) {
	"use strict";
	return ManagedObect.extend('be.wl.fio.FioriAdmin.model.Page', {
		metadata: {
			properties: {
				instanceId: "string",
				pageId: "string",
				name: "string",
				lastChanged: "object",
				targetmappings: "int",
				tiles: "int",
				total: "int",
				type: "string",
				catalogId: "string",
				originalLanguage: "string",
				isCatalogPage: "string",
				chipInstanceCount: "string",
				isPersLocked: "string",
				isReadOnly: "string",
				scope: "string",
				layout: "object",
				outdated: "string",
			},
			aggregations: {
				chips: {
					type: 'be.wl.fio.FioriAdmin.model.Chip',
					multiple: true
				}
			}
		},
		setAllProperties: function (oPage, sType) {
			var oLayout = {};
			try {
				oLayout = JSON.parse(oPage.layout);
			} catch (ex) {}
			this.setPageId(oPage.id);
			this.setCatalogId(oPage.catalogId || "");
			this.setName(oPage.title);
			this.setLastChanged(oPage.updated);
			this.setType(sType);
			this.setOriginalLanguage(oPage.originalLanguage || "");
			this.setIsCatalogPage(oPage.isCatalogPage || "");
			this.setChipInstanceCount(oPage.chipInstanceCount || "");
			this.setIsPersLocked(oPage.isPersLocked || "");
			this.setIsReadOnly(oPage.isReadOnly || "");
			this.setScope(oPage.scope || "");
			this.setLayout(oLayout);
			this.setOutdated(oPage.outdated || "");
		},
		rebuildLayout: function (iTileTypeForNewTiles) {
			var aInstances = this.getChips().map(function (oChip) {
				return oChip.getInstanceId();
			});
			var oLayoutInstances = this.getFlatLayout();
			var oLayout = aInstances.reduce(function (oNewLayout, sInstanceId) {
				var sInstanceFound = oLayoutInstances.filter(function (oInstance) {
					return oInstance.id === sInstanceId;
				})[0] || false;
				if (sInstanceFound) {
					oNewLayout[sInstanceFound.type].push(sInstanceFound.id);
					return oNewLayout;
				}
				oNewLayout[iTileTypeForNewTiles === 0 ? "order" : "linkOrder"].push(sInstanceId);
				return oNewLayout;
			}, {
				order: [],
				linkOrder: []
			});

			//only keep the instances that are in the group
			// oLayout.order = this.getChips().map(function (oChip) {
			// 	return oChip.getInstanceId();
			// }) || [];
			this.setLayout(oLayout);
			return oLayout;
		},
		getFlatLayout: function () {
			var oLayout = this.getLayout();
			return oLayout.order.map(function (sInstanceId) {
				return {
					id: sInstanceId,
					type: "order"
				};
			}).concat(oLayout.linkOrder.map(function (sInstanceId) {
				return {
					id: sInstanceId,
					type: "linkOrder"
				};
			}));
		},
		removeChipById: function (sInstanceId) {
			var removeChip = this.getChips().filter(function (oChip) {
				return oChip.getInstanceId() === sInstanceId;
			});
			if (removeChip && removeChip.length > 0) {
				this.removeChip(removeChip[0]);
			}
		},
		getAsGroupForUpdate: function (sInstanceId) {
			// var oLayout = this.getLayout();
			// oLayout.order.push(sInstanceId);
			// this.setLayout(oLayout);
			// this.rebuildLayout();
			return {
				id: this.getPageId(),
				title: this.getName(),
				catalogId: this.getCatalogId(),
				layout: JSON.stringify(this.getLayout()),
				originalLanguage: this.getOriginalLanguage(),
				isCatalogPage: this.getIsCatalogPage(),
				chipInstanceCount: this.getChipInstanceCount(),
				isPersLocked: this.getIsPersLocked(),
				isReadOnly: this.getIsReadOnly,
				scope: this.getScope(),
				updated: this.getLastChanged(),
				outdated: this.getOutdated()
			};
		},
		getSelectedChips: function () {
			return this.getChips().filter(function (oChip) {
				return oChip.getIsSelected();
			});
		},
		hasSelectionTargetMapping: function () {
			return (this.getSelectedChips().filter(function (oChip) {
				return !oChip.getTileType().getIsTile();
			}) || []).length > 0;
		},
		setSelectForAllChips: function (bSelected) {
			this.getChips().forEach(function (oChip) {
				oChip.setIsSelected(bSelected);
			});
		},
		setChipsAsTiles: function (aChips) {
			aChips.forEach(function (oPageChip) {
				this.addChipAsTile(oPageChip);
			}.bind(this));
			this.setTotal(this.getChips().length);
			var iTiles = this.getChips().filter(function (oChip) {
				return oChip.getTileType().getIsTile();
			}).length;
			this.setTiles(iTiles);
			this.setTargetmappings(this.getChips().length - iTiles);
			//TODO: combine target mapping and tiles
			//only for tiles 
			// aChips.filter(function (oPageChip) {
			// 	return oPageChip.chipId.indexOf("ACTION") === -1;
			// }).forEach(function (oPageChip) {
			// 	this.addChipAsTile(oPageChip);
			// }.bind(this));

			//TODO: combine target mapping and tiles
			// aChips.filter(function (oPageChip) {
			// 	return oPageChip.chipId.indexOf("ACTION") !== -1;
			// }).forEach(function (oPageChip) {
			// 	var oFoundTile = this.getTiles().filter(function (oTile) {
			// 		return oTile.getSemanticObject() === oPageChip.Chip.navigation_semantic_object && oTile.getSemanticAction() === oPageChip.Chip
			// 			.navigation_semantic_action;
			// 	})[0] || false;
			// 	oFoundTile && oFoundTile.addChipAsTargetMapping(oPageChip);
			// }.bind(this));
		},
		addChipAsTile: function (oChipPage) {
			if (oChipPage.ChipInstanceBags.results && oChipPage.ChipInstanceBags.results.length > 0 && oChipPage.ChipInstanceBags.results[0].ChipInstanceProperties) {
				var oFoundProp = oChipPage.ChipInstanceBags.results[0].ChipInstanceProperties.results.filter(function (oProp) {
					return oProp.name === "display_title_text" || oProp.name === "title";
				});
				var sTitle = oFoundProp && oFoundProp.length > 0 && oFoundProp[0].value;
			}
			var oNewTile = new Chip({
				tileId: oChipPage.pageId,
				instanceId: oChipPage.instanceId,
				name: this.getType() === "CATALOG" ? (sTitle || oChipPage.title) : (oChipPage.Chip && oChipPage.Chip.title),
				lastChanged: oChipPage.updated
			});

			oNewTile.setConfig(this.getType() === "CATALOG" ? oChipPage.configuration : (oChipPage.Chip && oChipPage.Chip.configuration));
			oNewTile.setChipAsTileType(this.getType() === "CATALOG" ? oChipPage.Chip : {
				id: "Launcher",
				title: "Tile"
			});

			this.addChip(oNewTile);
		},
		addTargetMappingToTile: function (oChipPage) {

		},
		_noTileFound: function (oChipPage) {
			//create empty tile object to add targetmapping
		},
		_createEmptyTile: function (oChipPage) {

		}
	});
});