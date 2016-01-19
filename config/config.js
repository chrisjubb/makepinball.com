define(["jquery", "underscore", "backbone"], function($, _, Backbone) {

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

	var ConfigView = Backbone.View.extend({
		inputModels: [],

		render: function() {
			this.$el.empty();
			this.inputModels = [];

			var self = this;
			this.model.ready(function() {
				self.$el.append("<form></form>");
				var $form = self.$el.find("form");

				_.each(self.model.getConfig(), function(entry) {
					var element = new ConfigViewElement({ model: entry, configAndSettings: self.model });
					$form.append(element.render().el);
					element.update();
					self.inputModels.push(element);
				});
			});

			return this;
		},

		updateValues: function() {
			_.each(this.inputModels, function(input) {
				input.update();
			});
		}
	});

	var configSliderUpdate = function(value, outputId) {
		$("#" + outputId).html(value);
	}

	var ConfigViewElement = Backbone.View.extend({

		initialize: function(params) {
			this.model = params.model; // for the individual entry
			this.configAndSettings = params.configAndSettings;
		},

		render: function() {
			this.$el.empty();

			if(this.model.type == "float") {
				this.$el.html("<div>" + this.model.name +
							  ": <input type='range' min='" + this.model.min + "' max='" + this.model.max + "' step='" + this.model.step + "' " +
							  "id='" + this.getInputId() + "' " +
							  "value='" + this.getCurrentValue() + "' oninput='configSliderUpdate(value, \"" + this.getOutputId() + "\")'></input>" +
							  "<output id='" + this.getOutputId() + "' for='" + this.getInputId() + "'></output>" +
							  "</div><br>");
			}
			else {
				this.$el.html("unsupported type: " + this.model.type);
			}

			return this;
		},

		getCurrentValue: function() {
			return this.configAndSettings.get(this.model.name)
		},

		getOutputValue: function() {
			var outputHTML = $("#" + this.getOutputId()).html();
			if(outputHTML) {
				return parseFloat(outputHTML);
			}
			else {
				return this.getCurrentValue();
			}
		},

		update: function() {
			this.configAndSettings.setValue(this.model.name, this.getOutputValue());
			configSliderUpdate(this.getCurrentValue(), this.getOutputId());
		},

		getInputId: function() {
			return "config_" + this.model.name;
		},

		getOutputId: function() {
			return "config_output_" + this.model.name;
		}
	});

}); // define

