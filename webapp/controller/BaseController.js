/*global history */
var _fragments = [];
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";
	return Controller.extend("be.elia.fio.FioriAdmin.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		onInit: function () {
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		getPrevMatchedRoute: function () {
			this.getRouter()._oRouter._prevMatchedRequest; // eslint-disable-line
		},
		getEventBus: function () {
			return this.getOwnerComponent().getEventBus();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		onExit: function () {
			//do not clear on exit
			//Fiori launchpad will execute onExit but keep the fragment
			for (var fragId in _fragments) {
				_fragments[fragId] && _fragments[fragId].fragment && _fragments[fragId].fragment.destroy && _fragments[fragId].fragment.destroy() && // eslint-disable-line
					_fragments[fragId].controller.destroy && _fragments[fragId].controller.destroy(); // eslint-disable-line
			}
			_fragments = [];
		},
		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			try {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			} catch (ex) {
				this.getRouter().navTo("master", {}, true);
				return;
			}
			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},
		openFragment: function (sName, model, updateModelAlways, callback, data, popoverSource, autoOpen) {
			if (autoOpen === undefined || autoOpen === null) {
				autoOpen = true;
			}
			if (sName.indexOf(".") > 0) {
				var aViewName = sName.split(".");
				sName = sName.substr(sName.lastIndexOf(".") + 1);
			} else { //current folder
				aViewName = this.getView().getViewName().split("."); // view.login.Login
			}
			aViewName.pop();
			var sViewPath = aViewName.join("."); // view.login
			// if (sViewPath.toLowerCase().indexOf("fragments") > 0) {
			sViewPath += ".";
			// } else {
			// 	sViewPath += ".fragments.";
			// }
			var controllerPath = sViewPath.replace("view", "controller");
			var id = this.getView().getId() + "-" + sName;
			if (!_fragments[id]) {
				try {
					var controller = sap.ui.controller(controllerPath + sName);
					var bControllerFound = true;
				} catch (ex) {
					controller = this;
					bControllerFound = false;
					console.error(ex);
				}
				_fragments[id] = {
					fragment: sap.ui.xmlfragment(
						id,
						sViewPath + sName,
						controller
					),
					controller: controller,
					hasOwnController: bControllerFound
				};
				if (model && !updateModelAlways) {
					_fragments[id].fragment.setModel(model);
				}
				// version >= 1.20.x
				if (!popoverSource) {
					this.getView().addDependent(_fragments[id].fragment);
				}
			}

			var fragment = _fragments[id].fragment;
			if (model && updateModelAlways) {
				fragment.setModel(model);
			}
			if (_fragments[id].controller && _fragments[id].hasOwnController && _fragments[id].controller.onBeforeShow) {
				_fragments[id].controller.onBeforeShow(this, fragment, callback, data, popoverSource);
			}
			var time = 1;
			// if (popoverSource) {
			// 	time = 1000;
			// }
			if (autoOpen) {
				setTimeout(function () {
					if (popoverSource) {
						fragment.openBy(popoverSource);
					} else {
						fragment.open(data && data.search ? data.search : '');
					}
				}, time);
			}
		},
		getFragmentControlById: function (parent, id) {
			var latest = this.getMetadata().getName().split(".")[this.getMetadata().getName().split(".").length - 1];
			return sap.ui.getCore().byId(parent.getView().getId() + "-" + latest + "--" + id);
		},
		closeFragments: function () {
			for (var f in _fragments) {
				if (_fragments[f] && _fragments[f].fragment["isOpen"] && _fragments[f].fragment.isOpen()) {
					_fragments[f].fragment.close();
				}
			}
		},
		getFragment: function (fragment) {
			return _fragments[this.getView().getId() + "-" + fragment];
		}

	});

});