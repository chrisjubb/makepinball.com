var Pin = Pin || {};

Pin.Game = Class.extend({

	lightState: [],
	forceState: [],

	init: function() {
	},

	update: function(switchState) {
		this.forceState[0] = switchState[1002];
	},

	getLightState: function() {
		return this.lightState;
	},

	getForceState: function() {
		return this.forceState;
	}

});
