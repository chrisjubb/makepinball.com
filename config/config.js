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
			callback.call(self);
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
			callback.call(this);
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
		this.model.ready(function() {
			self.$el.append("<form></form>");
			var $form = self.$el.find("form");

			_.each(self.model.getConfig(), function(entry) {
				var element = new ConfigViewElement({ model: entry, configAndSettings: self.model });
				$form.append(element.render().el);
			});
		});

		return this;
	}
});

var ConfigViewElement = Backbone.View.extend({

	initialize: function(params) {
		this.model = params.model; // for the individual entry
		this.configAndSettings = params.configAndSettings;
	},

	render: function() {
		this.$el.empty();

		this.$el.html("<div>" + this.model.name + ": <input id='" + this.model.name + "' value='" + this.configAndSettings.get(this.model.name) + "'></input></div><br>");

		return this;
	}
});