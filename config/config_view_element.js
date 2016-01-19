// global eek
var configSliderUpdate = function(value, outputId) {
	$("#" + outputId).html(value);
}

define(["underscore", "backbone"], function(_, Backbone) {

return Backbone.View.extend({

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

}); // require