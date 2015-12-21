var Pin = Pin || {};

Pin.Game = Class.extend({

	// special ids - don't want this colliding
	SW_LEFT_FLIPPER: 	1000,
	SW_RIGHT_FLIPPER: 	1001,
	SW_PLUNGER_BUTTON: 	1002,

	lightState: [],
	forceState: [],
	forceFromSwitchState: [],

	init: function() {
	},

	update: function(switchState) {
		// todo - need to get these magic numbers from the view
		this.forceState[0] = switchState[this.SW_PLUNGER_BUTTON];

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
			this.constructFlipperData(0, this.SW_LEFT_FLIPPER,   1),
			this.constructFlipperData(1, this.SW_RIGHT_FLIPPER, -1)
		];
	},

	getInputMapping: function() {
		return [
			{ keyCode: 65, switchIndex: this.SW_LEFT_FLIPPER },		// 'A'
			{ keyCode: 76, switchIndex: this.SW_RIGHT_FLIPPER },	// 'L'
			{ keyCode: 70, switchIndex: this.SW_PLUNGER_BUTTON },	// 'F'
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
