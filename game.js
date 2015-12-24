var Pin = Pin || {};

Pin.Game = Class.extend({

	// special ids - don't want this colliding
	SW_LEFT_FLIPPER: 	100,
	SW_RIGHT_FLIPPER: 	101,
	SW_PLUNGER_BUTTON: 	102,

	numberOfLights: 64,
	lightState: [],
	forceState: [],
	forceFromSwitchState: [],
	forceFromCenterAndSwitchState: [],

	targetBank0: undefined,
	targetBank1: undefined,

	init: function() {
		for(var i = 0; i < this.numberOfLights; ++i) {
			this.lightState.push(new Pin.Light());
		}

		var targetBankData0 = [];
		for(var i = 0; i < 4; ++i) {
			targetBankData0.push({ light: this.lightState[i], switchIndex: 10 + i });
		}
		this.targetBank0 = new Pin.TargetBank(targetBankData0);
		this.targetBank0.setLitColour(1,1,0, 1);
		this.targetBank0.pusle(1,1,0, 1);

		var targetBankData1 = [];
		for(var i = 4; i < 11; ++i) {
			targetBankData1.push({ light: this.lightState[i], switchIndex: 10 + i });
		}
		this.targetBank1 = new Pin.TargetBank(targetBankData1);
		this.targetBank1.setLitColour(1,0.6,0, 1);
		this.targetBank1.pusle(1,0.6,0, 1);
	},

	update: function(switchState, delta) {
		this.forceState[0] = switchState[this.SW_PLUNGER_BUTTON];

		// we want these to fire based on which bodies are active in the switch area.
		// this can be used for slingshots.
		this.forceFromSwitchState[2] = switchState[2];
		this.forceFromSwitchState[3] = switchState[3];

		// we want this to fire based on the bodies active in the switch area
		// AND we want it to do the force away from the center of the force.
		// this can be used for pop bumpers.
		this.forceFromCenterAndSwitchState[4] = switchState[4];

		// update target banks
		this.targetBank0.update(switchState);
		this.targetBank1.update(switchState);

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
			this.constructFlipperData(1, this.SW_RIGHT_FLIPPER, -1),
			this.constructFlipperData(2, this.SW_RIGHT_FLIPPER, -1)
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
	},

	getForceFromCenterAndSwitchState: function() {
		return this.forceFromCenterAndSwitchState;
	}

});
