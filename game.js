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
	deactivateFromSwitchState: [],
	activateFromSwitchState: [],

	// l = light index
	// s = switch index
	targetBankList0: [
						{l: 0, s: 10},
						{l: 1, s: 11},
						{l: 2, s: 12},
						{l: 3, s: 13},
					 ],
	targetBankList1: [
						{l: 4,  s: 14},
						{l: 5,  s: 15},
						{l: 6,  s: 16},
						{l: 7,  s: 17},
						{l: 8,  s: 18},
						{l: 9,  s: 19},
						{l: 10, s: 20},
					 ],
	targetBankList2: [
						{l: 11, s: 21},
						{l: 12, s: 22},
						{l: 13, s: 23},
						{l: 14, s: 24},
						{l: 15, s: 25},
					 ],
	targetBankList3: [
						{l: 16, s: 26},
						{l: 17, s: 27},
						{l: 18, s: 28},
					 ],
	targetBanks: [],

	scoop0: undefined,

	lightIndicator0: undefined,

	init: function() {
		var self = this;
		for(var i = 0; i < this.numberOfLights; ++i) {
			this.lightState.push(new Pin.Light());
		}

		var targetBankColour0 = { r: 1, g: 1, b: 0, a: 1 };
		var targetBank0 = new Pin.TargetBank(this.createTargetBankData(
																this.targetBankList0,
																this.lightState));
		targetBank0.setLitColour(targetBankColour0);
		targetBank0.pulse(targetBankColour0);
		this.targetBanks.push(targetBank0);

		var targetBankColour1 = { r: 1, g: 0.6, b: 0, a: 1 };
		var targetBank1 = new Pin.TargetBank(this.createTargetBankData(
																this.targetBankList1,
																this.lightState));
		targetBank1.setLitColour(targetBankColour1);
		targetBank1.pulse(targetBankColour1);
		this.targetBanks.push(targetBank1);

		var targetBankColour2 = { r: 0.4, g: 0.5, b: 1, a: 1 };
		var targetBank2 = new Pin.TargetBank(this.createTargetBankData(
																this.targetBankList2,
																this.lightState));
		targetBank2.setLitColour(targetBankColour2);
		targetBank2.pulse(targetBankColour2);
		this.targetBanks.push(targetBank2);

		var targetBankColour3 = { r: 0.9, g: 0.2, b: 0.1, a: 1 };
		var targetBank3 = new Pin.TargetBank(this.createTargetBankData(
																this.targetBankList3,
																this.lightState));
		targetBank3.setLitColour(targetBankColour3);
		targetBank3.pulse(targetBankColour3);
		this.targetBanks.push(targetBank3);

		this.scoop0 = new Pin.Scoop(6);

		// shoot again
		this.lightState[40].flash(0.1, 0.1, 0.8,  1.0, 0.25);

		// by pop bumpers
		var lightIndicatorColour0 = {r: 0.1, g: 1, b: 1, a: 1};
		this.lightIndicator0 = new Pin.LightIndicator(this.lightState, 	lightIndicatorColour0.r,
																		lightIndicatorColour0.g,
																		lightIndicatorColour0.b,
																		lightIndicatorColour0.a,
																		45, 56,
																		[4, 5]);
		// center indicator diamond
		var centerDiamondData = [
			{ colour: targetBankColour0 },
			{ colour: targetBankColour1 },
			{ colour: targetBankColour2 },
			{ colour: targetBankColour3 },
			{ colour: lightIndicatorColour0 }
		];
		var currentPulseColour = {r: 0.7, g: 0.7, b: 0.7, a: 1.0};
		this.centerDiamond = new Game.Diamond(this.lightState, 20, 35, currentPulseColour, centerDiamondData);
	},

	update: function(switchState, elapsedTime, delta) {
		var self = this;
		this.forceState[0] = switchState[this.SW_PLUNGER_BUTTON];

		// we want these to fire based on which bodies are active in the switch area.
		// this can be used for slingshots.
		this.forceFromSwitchState[2] = switchState[2];
		this.forceFromSwitchState[3] = switchState[3];

		// we want this to fire based on the bodies active in the switch area
		// AND we want it to do the force away from the center of the force.
		// this can be used for pop bumpers.
		this.forceFromCenterAndSwitchState[4] = switchState[4];
		this.forceFromCenterAndSwitchState[5] = switchState[5];

		// update target banks
		_.each(this.targetBanks, function(targetBank, targetBankIndex) {
			targetBank.update(switchState);
			if(targetBank.isComplete()) {
				self.centerDiamond.completedGoal(targetBankIndex);
			}
		});

		if(this.lightIndicator0.isComplete()) {
			this.centerDiamond.completedGoal(this.targetBanks.length); // want banks + 1
		}

		for(var i = 60; i <= 62; ++i) {
			if(this.centerDiamond.canCollect()) {
				var t = (i - 60.0) / (62.0 - 60.0);
				this.lightState[i].pulse(t * 0.2, 1.0, t * 0.3, 1.0,  (t * 0.2) + 0.1);
			}
			else {
				this.lightState[i].reset();
			}
		}

		this.scoop0.update(switchState);

		this.lightIndicator0.update(switchState, delta, elapsedTime);

		_.each(this.lightState, function(lightData) {
			lightData.update(delta);
		});

		this.deactivateFromSwitchState[this.scoop0.getSwitchIndex()] = this.scoop0.shouldDeactivate();

		// temporary logic for testing - releases after 1 second.
		if(this.scoop0.shouldDeactivate()) {
			var self = this;
			this.centerDiamond.collect();
			setTimeout(function() {
				self.wantsRelease = true;
			}, 1000);
		}

		if(this.wantsRelease) {
			this.scoop0.release();
			this.wantsRelease = undefined;
		}
		// temporary logic for testing.

		this.activateFromSwitchState[this.scoop0.getSwitchIndex()] = this.scoop0.shouldActivate();
	},

	createTargetBankData: function(dataList, lightState) {
		var targetBankData = [];
		_.each(dataList, function(item) {
			targetBankData.push({ light: lightState[item.l], switchIndex: item.s });
		});

		return targetBankData;
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

	getForceSwitchData: function() {
		var forceSwitchData = [];

		var leafSwitchForceRequired = 5.0;
		// fall much slower down the side
		var sideForceRequired = 2.0;

		var leafSwitchMinDotProduct = 0.6;

		_.each(this.targetBankList0, function(item) {
			forceSwitchData[item.s] = {	forceRequired: leafSwitchForceRequired,
										minDotProduct: leafSwitchMinDotProduct };
		});
		_.each(this.targetBankList1, function(item) {
			forceSwitchData[item.s] = {	forceRequired: leafSwitchForceRequired,
										minDotProduct: leafSwitchMinDotProduct };
		});
		_.each(this.targetBankList2, function(item) {
			forceSwitchData[item.s] = {	forceRequired: sideForceRequired,
										minDotProduct: leafSwitchMinDotProduct };
		});

		return forceSwitchData;
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
	},

	getDeactivateFromSwitchState: function() {
		return this.deactivateFromSwitchState;
	},

	getActivateFromSwitchState: function() {
		return this.activateFromSwitchState;
	},
});
