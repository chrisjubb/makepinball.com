var Config = Backbone.Model.extend({

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
			callback.call(this, self.configJson, self.settingsJson);
		});
		this.readyCallbacks = [];
	},

	get: function(id) {
		return this.settingsJson[id];
	},

	getSettings: function() {
		return this.settingsJson;
	},

	getConfig: function() {
		return this.configJson;
	},

	ready: function(callback) {
		if(this.configJson && this.settingsJson) {
			callback(this.configJson, this.settingsJson);
		}
		else {
			this.readyCallbacks.push(callback);
		}
	}
});

var ConfigView = Backbone.View.extend({
	render: function() {
		this.$el.empty();

		var self = this;
		this.model.ready(function(config, settings) {
			var output = "<form>";
			_.each(config, function(entry) {
				output += "<input id='" + entry.name + "' value='" + entry.minimum + "'></input><br>";
			});
			output += "</form>";

			self.$el.html(output);
		});

		return this;
	}
});
