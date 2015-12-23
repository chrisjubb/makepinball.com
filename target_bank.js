var Pin = Pin || {};

Pin.TargetBank = Class.extend({

	bankData: undefined,
	litColour: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
	pulseColour: { r: 0.6, g: 0.6, b: 1.0, a: 1.0 },

	init: function(bankData) {
		this.bankData = bankData;
	},

	setLitColour: function(r, g, b, a) {
		this.litColour = { r: r, g: g, b: b, a: a };
	},

	pusle: function(r, g, b, a) {
		this.pulseColour = { r: r, g: g, b: b, a: a };
		_.each(this.bankData, function(bankItem) {
			bankItem.light.pulse(r, g, b, a);
		});
	},

	update: function(switchState) {
		var self = this;
		_.each(this.bankData, function(bankItem) {
			if(switchState[bankItem.switchIndex]) {
				//bankItem.light.set(0.6,0.6,1,1);
				bankItem.light.set(self.litColour.r, self.litColour.g, self.litColour.b, 1);
			}
		});
	}
});