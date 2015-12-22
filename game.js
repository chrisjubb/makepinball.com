var Pin = Pin || {};

Pin.Game = Class.extend({

	// special ids - don't want this colliding
	SW_LEFT_FLIPPER: 	1000,
	SW_RIGHT_FLIPPER: 	1001,
	SW_PLUNGER_BUTTON: 	1002,

	numberOfLights: 64,
	lightState: [],
	forceState: [],
	forceFromSwitchState: [],

	init: function() {
		for(var i = 0; i < this.numberOfLights; ++i) {
			this.lightState.push(new Pin.Light());
		}
	},

	update: function(switchState, delta) {
		this.forceState[0] = switchState[this.SW_PLUNGER_BUTTON];

		// we want these to fire based on which bodies are active in the switch area
		this.forceFromSwitchState[2] = switchState[2];
		this.forceFromSwitchState[3] = switchState[3];
		this.forceFromSwitchState[4] = switchState[4];

		for(var i = 0; i < 4; ++i) {
			var lightData = this.lightState[i];
			if(lightData) {
				if(switchState[2]) {
					lightData.set(0,1,0,1);
				}
				else if(switchState[3]) {
					lightData.set(0.6,0.6,1,1);
				}
				else if(switchState[4]) {
					lightData.set(1,0,0,1);
				}
				else {
					lightData.fadeOut();
				}
			}
		}

		for(var i = 4; i < 9; ++i) {
			var lightData = this.lightState[i];
			if(lightData) {
				lightData.pulse(1,1,0, 1);
			}
		}

		_.each(this.lightState, function(lightData) {
			lightData.update(delta);
		});
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
