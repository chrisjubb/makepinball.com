var Pin = Pin || {};

Pin.LightIndicator = Class.extend({

	value: 0,
	onColour: undefined,
	lights: [],
	validSwitches: undefined,
	state: undefined,
	STATE_HITTING: 0,
	STATE_HIT: 1,
	STATE_HIT_WAITING: 2,
	STATE_COMPLETE: 3,
	STATE_FLASHING_COMPLETE: 4,
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
		_.each(this.lights, function(light) {
			light.reset();
		});
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

	isHit: function() {
		return this.state == this.STATE_HIT;
	},

	update: function(switchState, deltaTime, elapsedTime) {
		if(this.state == this.STATE_HITTING) {
			var isHit = false;
			this.updateDisplay();
			_.each(this.validSwitches, function(validSwitch) {
				if(switchState[validSwitch]) {
					isHit = true;
				}
			});

			if(isHit) {
				this.increase();
				if(this.value == this.lights.length) {
					this.state = this.STATE_COMPLETE;
					this.timer = elapsedTime + 0.75;

					var c = this.onColour;
					_.each(this.lights, function(light) {
						light.reset();
						light.flash(c.r, c.g, c.b, c.a, 0.15);
					});
				}
				else {
					this.state = this.STATE_HIT;
					this.timer = elapsedTime + 0.25;
				}
			}
		}
		else if(this.state == this.STATE_HIT) {
			this.state = this.STATE_HIT_WAITING;
		}
		else if(this.state == this.STATE_HIT_WAITING) {
			if(elapsedTime > this.timer) {
				this.state = this.STATE_HITTING;
			}
		}
		else if(this.state == this.STATE_COMPLETE) {
			this.state = this.STATE_FLASHING_COMPLETE;
		}
		else if(this.state == this.STATE_FLASHING_COMPLETE) {
			if(elapsedTime > this.timer) {
				this.reset();
			}
		}
	}
});