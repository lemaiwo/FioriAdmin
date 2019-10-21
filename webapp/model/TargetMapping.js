sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObect) {
	"use strict";
	return ManagedObect.extend('be.wl.fio.FioriAdmin.model.TargetMapping', {
		metadata: {
			properties: {
				targetMappingId: "string",
				name: "string"
			}
		}
	});
});