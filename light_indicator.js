var Pin = Pin || {};

Pin.LightIndicator = Class.extend({

	value: 0,
	onColour: undefined,
	lights: [],
	validSwitches: undefined,
	state: undefined,
	STATE_HITTING: 0,
	STATE_COMPLETE: 1,
	STATE_FLASHING_COMPLETE: 2,
	timer: 0.0,

	init: function(lightState, r, g, b, a, startIndex, endIndex, validSwitches) {
		for(var i = startIndex; i <= endIndex; ++i) {
			this.lights.push(lightState[i]);
		}
		this.onColour = { r: r, g: g, b: b, a: a };
		this.state = this.STATE_HITTING;
		this.validSwitches = validSwitches;
	},

	increase: function() {
		this.value = Math.min(this.value + 1, this.lights.length);
		this.updateDisplay();
	},

	setValue: function(value) {
		this.value = Math.min(value, this.lights.length);
		this.updateDisplay();
	},

	reset: function() {
		this.setValue(0);
		this.state = this.STATE_HITTING;
	},

	updateDisplay: function() {
		var self = this;
		_.each(this.lights, function(light, lightIndex) {
			if(lightIndex < self.value) {
				light.pulse(self.onColour.r, self.onColour.g, self.onColour.b, self.onColour.a);
			}
			else {
				light.reset();
			}
		});
	},

	isComplete: function() {
		return this.state == this.STATE_COMPLETE;
	},

	update: function(switchState, deltaTime, elapsedTime) {
		if(this.state == this.STATE_HITTING) {
			if(elapsedTime > this.timer) {
				var self = this;
				var isHit = false;
				_.each(this.validSwitches, function(validSwitch) {
					if(switchState[validSwitch]) {
						isHit = true;
					}
				});

				if(isHit) {
					this.increase();
					this.timer = elapsedTime + 0.25;

					if(this.value == this.lights.length) {
						this.state = this.STATE_COMPLETE;

						_.each(this.lights, function(light) {
							light.reset();
							var c = self.onColour;
							light.flash(c.r, c.g, c.b, c.a, 0.15);
						});

						setTimeout(function() {
							self.reset();
						}, 750);
					}
				}
			}
		}
		else if(this.state == this.STATE_COMPLETE) {
			this.state = this.STATE_FLASHING_COMPLETE;
		}
		else if(this.state == this.STATE_FLASHING_COMPLETE) {
		}
	}
});