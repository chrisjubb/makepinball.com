define(["underscore", "backbone"], function(_, Backbone) {

return Backbone.Model.extend({

	configJson: undefined,
	settingsJson: undefined,
	readyCallbacks: [],

	load: function(configFilename, settingsFilename) {
		console.log("Starting to load - " + settingsFilename);

		var self = this;
		self.settingsJson = undefined;
		self.configJson = undefined;
		$.getJSON(configFilename, function(configJson) {
			$.getJSON(settingsFilename, function(settingsJson) {
				self.processConfigAndSettings(configJson, settingsJson);
			});
		});

		return this;
	},

	processConfigAndSettings: function(configJson, settingsJson) {
		console.log("Completed loading");
		this.configJson = configJson;
		this.settingsJson = settingsJson;
		// todo - validate against schema.
		// todo - validate settings against the config

		var self = this;
		_.each(this.readyCallbacks, function(callback) {
			callback.call(self);
		});
		this.readyCallbacks = [];
	},

	get: function(id) {
		var output = this.settingsJson[id];
		if(output === undefined) {
			console.error("No setting called: " + id);
			return undefined;
		}
		return output;
	},

	setValue: function(id, value) {
		this.settingsJson[id] = value;
	},

	getSettings: function() {
		return this.settingsJson;
	},

	getConfig: function() {
		return this.configJson;
	},

	ready: function(callback) {
		if(this.configJson && this.settingsJson) {
			callback.call(this);
		}
		else {
			this.readyCallbacks.push(callback);
		}
	}
});

}); // define