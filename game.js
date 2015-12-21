var Pin = Pin || {};

Pin.Game = Class.extend({

	lightState: [],
	forceState: [],
	forceFromSwitchState: [],

	init: function() {
	},

	update: function(switchState) {
		// todo - need to get these magic numbers from the view
		this.forceState[0] = switchState[1002];

		// we want these to fire based on which bodies are active in the switch area
		this.forceFromSwitchState[2] = switchState[2];
		this.forceFromSwitchState[3] = switchState[3];
		this.forceFromSwitchState[4] = switchState[4];
	},

	constructFlipperData: function(flipperBodyIndex, switchIndex, directionMultiplier) {
		return {	flipperBodyIndex: flipperBodyIndex,
					switchIndex: switchIndex,
					directionMultiplier: directionMultiplier };
	},

	getFlipperData: function() {
		return [
			this.constructFlipperData(0, 1000, 1),
			this.constructFlipperData(1, 1001, -1)
		];
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
