var Pin = Pin || {};

Pin.TargetBank = Class.extend({

	bankData: undefined,
	litColour: 	 { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
	pulseColour: { r: 0.6, g: 0.6, b: 1.0, a: 1.0 },
	enabledState: [],
	state: undefined,
	STATE_HITTING: 0,
	STATE_FLASHING: 1,

	init: function(bankData) {
		this.bankData = bankData;
		this.reset();
	},

	setLitColour: function(r, g, b, a) {
		this.litColour = { r: r, g: g, b: b, a: a };
	},

	pusle: function(r, g, b, a) {
		this.pulseColour = { r: r, g: g, b: b, a: a };
		_.each(this.bankData, function(bankItem) {
			bankItem.light.reset();
			bankItem.light.pulse(r, g, b, a);
		});
	},

	update: function(switchState) {
		var self = this;

		if(this.state == this.STATE_HITTING) {
			_.each(this.bankData, function(bankItem) {
				if(switchState[bankItem.switchIndex]) {
					self.enabledState[bankItem.switchIndex] = true;
					bankItem.light.set(self.litColour.r, self.litColour.g, self.litColour.b, 1);
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

				this.state = this.STATE_FLASHING;
			}
		}

		if(this.state == this.STATE_FLASHING) {
		}
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