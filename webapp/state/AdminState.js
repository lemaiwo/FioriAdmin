sap.ui.define([
	"sap/ui/base/ManagedObject",
	"../service/CatalogService",
	"../model/Page",
	"../model/Progress",
	"../model/TileType",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/base/strings/capitalize"
], function (ManagedObect, CatalogService, Page, Progress, TileType, ManagedObjectModel, capitalize) {
	"use strict";

	return ManagedObect.extend('be.elia.fio.FioriAdmin.state.AdminState', {
		metadata: {
			properties: {
				pageType: {
					type: 'string',
					defaultValue: 'CATALOG'
				},
				catalogName: 'string',
				groupName: 'string',
				page: {
					type: 'be.elia.fio.FioriAdmin.model.Page'
				},
				copyToCatalog: 'string',
				assignToGroup: 'string',
				assignTileType: {
					type: 'int',
					defaultValue: 0
				},
				tableLoading: {
					defaultValue: false,
					type: 'boolean'
				},
				progress: 'be.elia.fio.FioriAdmin.model.Progress'
			},
			aggregations: {
				copyResult: {
					type: 'be.elia.fio.FioriAdmin.model.Chip',
					multiple: true
				}
			},
			events: {}
		},
		init: function () {},
		getModel: function () {
			if (!this.model) {
				this.model = new ManagedObjectModel(this);
			}
			return this.model;
		},
		getCurrentPageName: function () {
			return this.getPageType() === "CATALOG" ? this.getCatalogName() : this.getGroupName();
		},
		getPageTypeText: function () {
			return capitalize(this.getPageType().toLowerCase());
		},
		getCatalogGroupName: function () {
			return this.getPageType() === "GROUP" ? this.getGroupName() : ((this.getCatalogName().indexOf(":") > -1 ? "X-SAP-UI2-ADCAT" :
				"X-SAP-UI2-CATALOGPAGE") + ":" + this.getCatalogName());
		},
		loadCatalog: function () {
			this.setTableLoading(true);
			return CatalogService.getTiles(this.getCatalogGroupName()).then(this.setNewPage.bind(this)).catch(this.errorOccured.bind(this,
				'NOT_FOUND'));
		},
		errorOccured: function (id, oError) {
			this.setTableLoading(false);
			return Promise.reject(new Error({
				message: oError.message,
				id: id
			}));
		},
		setNewPage: function (response) {
			var oPage = response.data;
			this.setPage(this.createPageObject(oPage, this.getPageType()));
			this.getModel().refresh();
			this.setTableLoading(false);
			return true;
		},
		createPageObject: function (oPage, sType) {
			var oPageObj = new Page();
			oPageObj.setAllProperties(oPage, sType);
			oPageObj.setChipsAsTiles(oPage.PageChipInstances.results);
			return oPageObj;
		},
		assignToGroup: function () {
			return CatalogService.getPage(this.getAssignToGroup()).then(function (response) {
				return this.createPageObject(response.data, "GROUP");
			}.bind(this)).then(function (oGroup) {
				return this._processSelectedChipsOnByOne(this.assignToGroupPromise.bind(this, oGroup), 1, 1)
					.then(this.updateGroup.bind(this, oGroup)).catch(this.errorOccured.bind(this, 'ERROR_UPDATE_GROUP'));
			}.bind(this)).catch(this.errorOccured.bind(this, 'ERROR_GET_GROUP'));
		},
		updateGroup: function (oGroup) {
			this.setTableLoading(true);
			oGroup.rebuildLayout(this.getAssignTileType());
			return CatalogService.updateGroup(oGroup).then(function () {
				this.getProgress().setDone(this.getProgress().getDone() + 1);
				this.getModel().refresh();
				this.setTableLoading(false);
				return true;
			}.bind(this));
		},
		assignToGroupPromise: function (oGroup, oChip) {
			var aOperations = [CatalogService.assignChipToGroup(oGroup, this.getPage().getPageId(), oChip.getInstanceId())];
			return this._createChipPromiseAll(aOperations, oChip).then(function (oResponse) {
				if (oResponse.success) {
					oGroup.addChipAsTile(oResponse.response[0].data);
				}
				return oResponse;
			});
		},
		createReference: function () {
			return this._processSelectedChipsOnByOne(this.createReferencePromise.bind(this));
		},
		createReferencePromise: function (oChip) {
			var aOperations = [CatalogService.createReference(this.getPage().getPageId(), oChip.getInstanceId(), this.getCopyToCatalog())];
			return this._createChipPromiseAll(aOperations, oChip);
		},
		getWhereUsed: function () {
			return this._processSelectedChips(this.createWhereUsedPromise.bind(this));
		},
		deleteChips: function () {
			if (this.getPage().getType() === "CATALOG") {
				return this._processSelectedChips(this.isUsed.bind(this), 2).then(function (responses) {
					return (responses.filter(function (bResponse) {
						return bResponse;
					}) || []).length > 0;
				}).then(function (isUsed) {
					if (isUsed) {
						return Promise.reject(new Error('Tile or Target mapping still in use...'));
					}
					return isUsed;
				}).then(this._processSelectedChips.bind(this, this.createDeleteChipsPromise.bind(this))).then(this.loadCatalog.bind(this));
			} else {
				return this._processSelectedChips(this.createDeleteChipsPromise.bind(this), 1, 1).then(this.updateGroup.bind(this, this.getPage()))
					.then(this.loadCatalog.bind(this));
			}
		},
		createDeleteChipsPromise: function (oChip) {
			var aOperations = [CatalogService.deleteChip(this.getPage().getPageId(), oChip.getInstanceId())];
			return this._createChipPromiseAll(aOperations, oChip).then(function (oResponse) {
				if (oResponse.success) {
					this.getPage().removeChipById(oChip.getInstanceId());
				}
				return oResponse;
			}.bind(this));
		},
		isUsed: function (oChip) {
			return this.createWhereUsedPromise(oChip).then(function (oResponse) {
				return oResponse.response[0].data.results.length > 0 || oResponse.response[1].data.results.length > 0;
			});
		},
		createWhereUsedPromise: function (oChip) {
			var aOperations = [CatalogService.whereUsedCatalogs(this.getPage().getPageId(), oChip.getInstanceId()), CatalogService.whereUsedGroups(
				this.getPage().getPageId(), oChip.getInstanceId())];
			return this._createChipPromiseAll(aOperations, oChip).then(function (oResponse) {
				this.addPageToChip(oResponse.chip, oResponse.response[1].data.results, "GROUP");
				this.addPageToChip(oResponse.chip, oResponse.response[0].data.results, "CATALOG");
				this.getModel().refresh();
				return oResponse;
			}.bind(this));
		},
		addPageToChip: function (oChip, aPages, sType) {
			aPages.forEach(function (oPageData) {
				oChip["add" + capitalize(sType.toLowerCase())](new Page({
					pageId: sType === "CATALOG" ? oPageData.catalogId : oPageData.chipId,
					name: sType === "CATALOG" ? oPageData.title : oPageData.pageId,
					instanceId: sType === "CATALOG" ? oPageData.instanceId : "",
					type: sType
				}));
			});
		},
		updateProgress: function (oResponse) {
			this.getProgress().setDone(this.getProgress().getDone() + 1);
			this.addCopyResult(oResponse.chip);
			this.getModel().refresh();
			this.setTableLoading(false);
			return oResponse;
		},
		handleResponse: function (oResponse, oChip, success) {
			oChip.setStatus(success ? "Success" : "Error");
			oChip.setStatusMsg("Done");
			if (!success && oResponse && oResponse.error && oResponse.error.message && oResponse.error.message.value) {
				oChip.setStatusMsg(oResponse.error.message.value);
			}
			return {
				success: success,
				response: oResponse,
				chip: oChip
			};
		},
		_createChipPromiseAll: function (aOperations, oChip) {
			return Promise.all(aOperations)
				.then(function (oResponse) {
					return this.handleResponse(oResponse, oChip.clone(), true);
				}.bind(this)).catch(function (oResponse) {
					return this.handleResponse(oResponse, oChip.clone(), false);
				}.bind(this)).then(this.updateProgress.bind(this));
		},
		_startPRocess: function (iProcesses, iAddCalls) {
			this.setTableLoading(true);
			iProcesses = iProcesses && iProcesses > 0 ? iProcesses : 1;
			iAddCalls = iAddCalls && iAddCalls > 0 ? iAddCalls : 0;
			this.removeAllCopyResult();
			var aSelectedChips = this.getPage().getSelectedChips();
			this.setProgress(new Progress({
				todo: (aSelectedChips.length * iProcesses) + iAddCalls,
				done: 0
			}));
			return aSelectedChips;
		},
		_processSelectedChips: function (fnOperation, iProcesses, iAddCalls) {
			return Promise.all(this._startPRocess(iProcesses, iAddCalls).map(fnOperation));
		},
		_processSelectedChipsOnByOne: function (fnOperation, iProcesses, iAddCalls) {
			return this._processOnByOne(this._startPRocess(iProcesses, iAddCalls), fnOperation);
		},
		_processOnByOne: function (objects_array, iterator) {
			return objects_array.reduce(function (prom, object) {
				return prom.then(function () {
					return iterator(object);
				});
			}, Promise.resolve()); // initial
		}
	});
});