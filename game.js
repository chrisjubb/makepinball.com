var Pin = Pin || {};

Pin.Game = Class.extend({

	lightState: [],
	forceState: [],
	forceFromSwitchState: [],

	init: function() {
	},

	update: function(switchState) {
		this.forceState[0] = switchState[1002];

		// we want these to fire based on which bodies are active in the switch area
		this.forceFromSwitchState[2] = switchState[2];
		this.forceFromSwitchState[3] = switchState[3];
		this.forceFromSwitchState[4] = switchState[4];
	},

	getLightState: function() {
		return this.lightState;
	},

	getForceState: function() {
		return this.forceState;
	},

	getForceFromSwitchState: function() {
		return this.forceFromSwitchState;
	}

});
