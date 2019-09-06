sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObect) {
	"use strict";
	return ManagedObect.extend('be.elia.fio.FioriAdmin.model.TargetMapping', {
		metadata: {
			properties: {
				targetMappingId: "string",
				name: "string"
			}
		}
	});
});