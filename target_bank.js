var Pin = Pin || {};

Pin.TargetBank = Class.extend({

	bankData: undefined,
	litColour: 	 { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
	pulseColour: { r: 0.6, g: 0.6, b: 1.0, a: 1.0 },
	enabledState: [],
	state: undefined,
	STATE_HITTING: 0,
	STATE_COMPLETE: 1,
	STATE_FLASHING_COMPLETE: 2,

	init: function(bankData) {
		this.bankData = bankData;
		this.reset();
	},

	setLitColour: function(r, g, b, a) {
		if(r instanceof Object) {
			// should contain r,g,b,a
			this.litColour = r;
		}
		else {
			this.litColour = { r: r, g: g, b: b, a: a };
		}
	},

	pulse: function(r, g, b, a) {
		if(r instanceof Object) {
			this.pulseColour = r;
		}
		else {
			this.pulseColour = { r: r, g: g, b: b, a: a };
		}

		var self = this;
		_.each(this.bankData, function(bankItem) {
			bankItem.light.reset();
			bankItem.light.pulse(	self.pulseColour.r,
									self.pulseColour.g,
									self.pulseColour.b,
									self.pulseColour.a);
		});
	},

	update: function(switchState) {
		var self = this;

		if(this.state == this.STATE_HITTING) {
			var c = self.pulseColour;
			_.each(this.bankData, function(bankItem) {
				if( switchState[bankItem.switchIndex] ||
					self.enabledState[bankItem.switchIndex]) {

					self.enabledState[bankItem.switchIndex] = true;
					bankItem.light.set(self.litColour.r, self.litColour.g, self.litColour.b, self.litColour.a);
				}
				else if(!self.enabledState[bankItem.switchIndex]) {
					bankItem.light.pulse(c.r, c.g, c.b, c.a);
				}
			});

			var allComplete = true;
			_.each(this.bankData, function(bankItem) {
				if(!self.enabledState[bankItem.switchIndex]) {
					allComplete = false;
				}
			});

			if(allComplete) {
				console.log("Completed bank");
				_.each(this.bankData, function(bankItem) {
					bankItem.light.reset();
					var c = self.pulseColour;
					bankItem.light.flash(c.r, c.g, c.b, c.a, 0.15);
				});

				setTimeout(function() {
					self.reset();
				}, 750);

				this.state = this.STATE_COMPLETE;
			}
		}
		else if(this.state == this.STATE_COMPLETE) {
			// one frame
			this.state = this.STATE_FLASHING_COMPLETE;
		}
		else if(this.state == this.STATE_FLASHING_COMPLETE) {
		}
	},

	isComplete: function() {
		return this.state == this.STATE_COMPLETE;
	},

	reset: function() {
		var self = this;
		_.each(this.bankData, function(bankItem) {
			self.enabledState[bankItem.switchIndex] = false;
			var c = self.pulseColour;
			bankItem.light.reset();
			bankItem.light.pulse(c.r, c.g, c.b, c.a);
		});
		this.state = this.STATE_HITTING;
	}
});