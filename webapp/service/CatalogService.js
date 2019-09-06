sap.ui.define([
	"./CoreService",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (CoreService, ODataUtils, Filter, FilterOperator) {
	"use strict";

	var CatalogService = CoreService.extend("be.elia.fio.FioriAdmin.service.CatalogService", {
		constructor: function () {
			CoreService.call(this);
		},
		getTiles: function (sCatalogGroupName) {
			return this.odata("/Pages('" + encodeURIComponent(sCatalogGroupName) + "')").get({
				urlParameters: {
					$expand: 'Bags/Properties,PageChipInstances/Chip/ChipBags/ChipProperties,PageChipInstances/RemoteCatalog,PageChipInstances/ChipInstanceBags/ChipInstanceProperties'
				}
			});
		},
		getPage: function (sPageName) {
			return this.odata("/Pages('" + encodeURIComponent(sPageName) + "')").get({
				urlParameters: {
					$expand: 'PageChipInstances'
				}
			});
		},
		createReference: function (sSourcePageId, sSourceChipInstanceId, sTargetPageId) {
			return this.http(this.model.sServiceUrl + "/ClonePageChipInstance?sourcePageId='" + encodeURIComponent(sSourcePageId) +
				"'&sourceChipInstanceId='" +
				encodeURIComponent(sSourceChipInstanceId) + "'&targetPageId='" + encodeURIComponent("X-SAP-UI2-CATALOGPAGE:" + sTargetPageId) +
				"'").post({
				"x-csrf-token": this.model.getSecurityToken()
			});
		},
		whereUsedCatalogs: function (sCatalog, sInstanceId) {
			//X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:ZCAT_BYYYYXXXXA:00O2TF584P8W4BDAOJKEY3WJ6
			return this.odata("/Chips").get({
				filters: [new Filter({
					path: "referenceChipId",
					operator: FilterOperator.EQ,
					value1: "X-SAP-UI2-PAGE:" + sCatalog + ":" + sInstanceId
				})]
			});
		},
		whereUsedGroups: function (sCatalog, sInstanceId) {
			//X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:ZCAT_BYYYYXXXXA:00O2TF584P8W4BDAOJKEY3WJ6
			return this.odata("/PageChipInstances").get({
				filters: [new Filter({
					path: "chipId",
					operator: FilterOperator.EQ,
					value1: "X-SAP-UI2-PAGE:" + sCatalog + ":" + sInstanceId
				})]
			});
		},
		deleteChip: function (sCatalog, sInstanceId) {
			///PageChipInstances(pageId='X-SAP-UI2-CATALOGPAGE%3AZCAT_BYYYYXXXXA',instanceId='00O2TF584P8W4BDAOJKEY3WJ6')
			var sObjectPath = this.model.createKey("/PageChipInstances", {
				pageId: sCatalog,
				instanceId: sInstanceId
			});
			return this.odata(sObjectPath).delete();
		},
		assignChipToGroup: function (oGroup, sCatalog, sInstanceId) {
			return this.initiateNewChipInGroup(oGroup, sCatalog, sInstanceId);
			//save order 
			// .then(function (response) {
			// 	return this.updateGroup(oGroup, response);
			// }.bind(this));
		},
		initiateNewChipInGroup: function (oGroup, sCatalog, sInstanceId) {
			///"X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:ZCAT_SYYYYXXXXA:00O2TF584P8W1AY60A4XL54Z2"
			return this.odata("/PageChipInstances").post({
				pageId: oGroup.getPageId(),
				configuration: "",
				instanceId: "",
				layoutData: "",
				chipId: "X-SAP-UI2-PAGE:" + sCatalog + ":" + sInstanceId,
				title: ""
			});
		},
		updateGroup: function (oGroup) {
			var sObjectPath = this.model.createKey("/Pages", {
				id: oGroup.getPageId()
			});
			return this.odata(sObjectPath).put(oGroup.getAsGroupForUpdate());
		}
	});
	return new CatalogService();
});