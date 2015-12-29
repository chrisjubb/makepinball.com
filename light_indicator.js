var Pin = Pin || {};

Pin.LightIndicator = Class.extend({

	value: 0,
	onColour: undefined,
	lights: [],

	init: function(lightState, r, g, b, a, startIndex, endIndex) {
		for(var i = startIndex; i <= endIndex; ++i) {
			this.lights.push(lightState[i]);
		}
		this.onColour = { r: r, g: g, b: b, a:a };
	},

	increase: function() {
		this.value = Math.min(this.value + 1, this.lights.length);
		this.updateDisplay();
	},

	setValue: function(value) {
		this.value = Math.min(value, this.lights.length);
		this.updateDisplay();
	},

	updateDisplay: function() {
		var self = this;
		_.each(this.lights, function(light, lightIndex) {
			if(lightIndex < self.value) {
				light.set(self.onColour.r, self.onColour.g, self.onColour.b, self.onColour.a);
			}
			else {
				light.reset();
			}
		});
	}
});