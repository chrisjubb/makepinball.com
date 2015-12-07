var Config = Backbone.Model.extend({

	load: function(configFilename, settingsFilename) {
		console.log("Starting to load - " + settingsFilename);

		var self = this;
		$.getJSON(configFilename, function(configJson) {
			$.getJSON(settingsFilename, function(settingsJson) {
				self.processConfigAndSettings(configJson, settingsJson);
			});
		});
	},

	processConfigAndSettings: function(configJson, settingsJson) {
		this.configJson = configJson;
		this.settingsJson = settingsJson;
		// todo - validate against schema.
		// todo - validate settings against the config
	},

	get: function(id) {
		return this.settingsJson[id];
	},

	getSettings: function() {
		return this.settingsJson;
	},

	getConfig: function() {
		return this.configJson;
	}
});

var ConfigView = Backbone.View.extend({
	render: function() {
		this.$el.empty();

		var output = "<form>";
		_.each(this.model.getConfig(), function(entry) {
			output += "<input id='" + entry.name + "'>" + entry.minimum + "</input>";
		});
		output += "</form>";

		this.$el.html(output);

		return this;
	}
});
