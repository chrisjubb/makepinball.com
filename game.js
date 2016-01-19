define(["jclass", "underscore", "light", "sound_manager", "switch_event_handler", "target_bank", "scoop", "light_indicator", "game_diamond"],
function(JClass, _, Light, SoundManager, SwitchEventHandler, TargetBank, Scoop, LightIndicator, GameDiamond) {

return JClass.extend({

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

	state: undefined,
	STATE_MAIN: 1,
	STATE_COLLECTING_DIAMOND: 2,

	soundManager: undefined,
	soundMusic: undefined, // keep track of the music instance
	soundsToLoad: [
		{ name: "SOUND_MUSIC",			filename: "music.mp3" },

		{ name: "SOUND_BANK0_HIT",		filename: "bank0hit.mp3" },
		{ name: "SOUND_BANK0_COMPLETE", filename: "bank0complete.mp3" },

		{ name: "SOUND_BANK1_HIT",		filename: "bank1hit.mp3" },
		{ name: "SOUND_BANK1_COMPLETE", filename: "bank1complete.mp3" },

		{ name: "SOUND_BANK2_HIT",		filename: "bank2hit.mp3" },
		{ name: "SOUND_BANK2_COMPLETE", filename: "bank2complete.mp3" },

		{ name: "SOUND_BANK3_HIT",		filename: "bank3hit.mp3" },
		{ name: "SOUND_BANK3_COMPLETE", filename: "bank3complete.mp3" },

		{ name: "SOUND_FLIPPER",		filename: "flipper.mp3" },
		{ name: "SOUND_PLUNGE",			filename: "plunge.mp3" },

		{ name: "SOUND_POP_BUMPER_COMPLETE", filename: "pop_bumper_complete.mp3" },
		{ name: "SOUND_POP_BUMPER_HIT",	filename: "pop_bumper_hit.mp3" },

		{ name: "SOUND_SCOOP_START",	filename: "scoop_start.mp3" },
		{ name: "SOUND_SCOOP_PROGRESS",	filename: "scoop_progress.mp3" },
		{ name: "SOUND_SCOOP_COMPLETE",	filename: "scoop_complete.mp3" },

		{ name: "SOUND_SOLENOID_LOUD",	filename: "solenoid_loud.mp3" },
		{ name: "SOUND_SOLENOID0",		filename: "solenoid0.mp3" },
		{ name: "SOUND_SOLENOID1",		filename: "solenoid0.mp3" }
	],

	// todo - use this for the target banks too
	switchEventHandler: undefined,

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

	centerDiamond: undefined,
	diamondLightIndexStart: 20,
	diamondLightIndexEnd: 35,

	init: function() {
		var self = this;
		for(var i = 0; i < this.numberOfLights; ++i) {
			this.lightState.push(new Light());
		}

		this.state = this.STATE_MAIN;

		this.soundManager = new SoundManager();

		_.each(this.soundsToLoad, function(soundData) {
			self[soundData.name] = self.soundManager.load("sounds/" + soundData.filename);
		});

		this.switchEventHandler = new SwitchEventHandler();

		var targetBankColour0 = { r: 1, g: 1, b: 0, a: 1 };
		var targetBank0 = new TargetBank(this.createTargetBankData(
																this.targetBankList0,
																this.lightState));
		targetBank0.setLitColour(targetBankColour0);
		targetBank0.pulse(targetBankColour0);
		this.targetBanks.push(targetBank0);

		var targetBankColour1 = { r: 1, g: 0.6, b: 0, a: 1 };
		var targetBank1 = new TargetBank(this.createTargetBankData(
																this.targetBankList1,
																this.lightState));
		targetBank1.setLitColour(targetBankColour1);
		targetBank1.pulse(targetBankColour1);
		this.targetBanks.push(targetBank1);

		var targetBankColour2 = { r: 0.4, g: 0.5, b: 1, a: 1 };
		var targetBank2 = new TargetBank(this.createTargetBankData(
																this.targetBankList2,
																this.lightState));
		targetBank2.setLitColour(targetBankColour2);
		targetBank2.pulse(targetBankColour2);
		this.targetBanks.push(targetBank2);

		var targetBankColour3 = { r: 0.9, g: 0.2, b: 0.1, a: 1 };
		var targetBank3 = new TargetBank(this.createTargetBankData(
																this.targetBankList3,
																this.lightState));
		targetBank3.setLitColour(targetBankColour3);
		targetBank3.pulse(targetBankColour3);
		this.targetBanks.push(targetBank3);

		this.scoop0 = new Scoop(6);

		// by pop bumpers
		var lightIndicatorColour0 = {r: 0.1, g: 1, b: 1, a: 1};
		var LightIndicatorSwitches = [4, 5];
		this.lightIndicator0 = new LightIndicator(this.lightState, 	lightIndicatorColour0.r,
																	lightIndicatorColour0.g,
																	lightIndicatorColour0.b,
																	lightIndicatorColour0.a,
																	45, 56,
																	LightIndicatorSwitches);
		// center indicator diamond
		var centerDiamondData = [
			{ colour: targetBankColour0 },
			{ colour: targetBankColour1 },
			{ colour: targetBankColour2 },
			{ colour: targetBankColour3 },
			{ colour: lightIndicatorColour0 }
		];
		var currentPulseColour = {r: 0.7, g: 0.7, b: 0.7, a: 1.0};
		this.centerDiamond = new GameDiamond(	this.lightState,
												this.diamondLightIndexStart,
												this.diamondLightIndexEnd,
												currentPulseColour,
												centerDiamondData);


		// setup events
		this.switchEventHandler.triggerOn(this.getTargetBankSwitchArray(this.targetBankList0), this, function() {
			self.soundManager.play(self.SOUND_BANK0_HIT);
		});

		this.switchEventHandler.triggerOn(this.getTargetBankSwitchArray(this.targetBankList1), this, function() {
			self.soundManager.play(self.SOUND_BANK1_HIT);
		});

		this.switchEventHandler.triggerOn(this.getTargetBankSwitchArray(this.targetBankList2), this, function() {
			self.soundManager.play(self.SOUND_BANK2_HIT);
		});

		this.switchEventHandler.triggerOn(this.getTargetBankSwitchArray(this.targetBankList3), this, function() {
			self.soundManager.play(self.SOUND_BANK3_HIT);
		});

		this.switchEventHandler.triggerOn([2, 3], this, function() {
			self.soundManager.play(self.SOUND_SOLENOID1);
		});

		this.switchEventHandler.triggerOn([this.SW_PLUNGER_BUTTON], this, function() {
			self.forceState[0] = 1;
			self.soundManager.play(self.SOUND_PLUNGE);
			self.soundManager.play(self.SOUND_SOLENOID_LOUD);
		});

		this.switchEventHandler.triggerOn([this.SW_LEFT_FLIPPER, this.SW_RIGHT_FLIPPER], this, function() {
			self.soundManager.play(self.SOUND_FLIPPER);
		});

		this.soundManager.play(this.SOUND_MUSIC, function(instance) {
			// store for later
			self.soundMusic = instance;

			self.soundMusic.volume = 0.4;
			self.soundMusic.loop = -1;
		});
	},

	update: function(switchState, elapsedTime, delta) {
		var self = this;

		// this will get set to 1 in the switchEventHandler update if it needs to
		this.forceState[0] = 0;

		// we want these to fire based on which bodies are active in the switch area.
		// this can be used for slingshots.
		this.forceFromSwitchState[2] = switchState[2];
		this.forceFromSwitchState[3] = switchState[3];

		// we want this to fire based on the bodies active in the switch area
		// AND we want it to do the force away from the center of the force.
		// this can be used for pop bumpers.
		this.forceFromCenterAndSwitchState[4] = switchState[4];
		this.forceFromCenterAndSwitchState[5] = switchState[5];

		this.switchEventHandler.update(switchState);



		if(this.state == this.STATE_MAIN) {
			// update target banks
			_.each(this.targetBanks, function(targetBank, targetBankIndex) {
				targetBank.update(switchState);
				if(targetBank.isComplete()) {
					self.soundManager.play(self["SOUND_BANK" + targetBankIndex + "_COMPLETE"]);
					self.centerDiamond.completedGoal(targetBankIndex);
				}
			});

			if(this.lightIndicator0.isComplete()) {
				this.centerDiamond.completedGoal(this.targetBanks.length); // want banks + 1
				this.soundManager.play(this.SOUND_POP_BUMPER_HIT);
				this.soundManager.play(this.SOUND_POP_BUMPER_COMPLETE);
				this.soundManager.play(this.SOUND_SOLENOID0);
			}

			if(this.lightIndicator0.isHit()) {
				this.soundManager.play(this.SOUND_POP_BUMPER_HIT);
				this.soundManager.play(this.SOUND_SOLENOID0);
			}

			this.lightIndicator0.update(switchState, delta, elapsedTime);

				// show that can collect
			for(var i = 60; i <= 62; ++i) {
				if(this.centerDiamond.canCollect()) {
					var t = (i - 60.0) / (62.0 - 60.0);
					this.lightState[i].pulse(t * 0.2, 1.0, t * 0.3, 1.0,  (t * 0.2) + 0.1);
				}
				else {
					this.lightState[i].reset();
				}
			}
		}
		else if(this.state == this.STATE_COLLECTING_DIAMOND) {
			var currentLight = this.centerDiamond.currentLightColour();
			if(currentLight) {
				this.allLightsExceptDiamond(function(light, lightIndex) {
					light.reset();
					light.set(currentLight.r, currentLight.g, currentLight.b, currentLight.a);
					light.fadeOut(5.0);
				});
			}
		}

		this.centerDiamond.update(delta, elapsedTime);

		this.scoop0.update(switchState);

		_.each(this.lightState, function(lightData) {
			lightData.update(delta);
		});

		this.deactivateFromSwitchState[this.scoop0.getSwitchIndex()] = this.scoop0.shouldDeactivate();

		if(this.scoop0.shouldDeactivate()) {
			this.centerDiamond.collect(elapsedTime);
			this.soundMusic.stop();
			this.soundManager.play(this.SOUND_SCOOP_START);
			this.soundManager.play(this.SOUND_SOLENOID1);
			this.state = this.STATE_COLLECTING_DIAMOND;

			this.allLightsExceptDiamond(function(light, lightIndex) {
				light.reset();
				light.set(1,1,1,1);
				light.fadeOut(2.0);
			});
		}
		if(this.centerDiamond.isCollectProgress()) {
			this.soundManager.play(this.SOUND_SCOOP_PROGRESS);
		}
		if(this.centerDiamond.isCollectComplete()) {
			this.scoop0.release();
			this.soundMusic.play();
			this.soundManager.play(this.SOUND_SCOOP_COMPLETE);
			this.state = this.STATE_MAIN;
		}

		this.activateFromSwitchState[this.scoop0.getSwitchIndex()] = this.scoop0.shouldActivate();
	},

	createTargetBankData: function(dataList, lightState) {
		var targetBankData = [];
		_.each(dataList, function(item) {
			targetBankData.push({ light: lightState[item.l], switchIndex: item.s });
		});

		return targetBankData;
	},

	getTargetBankSwitchArray: function(dataList) {
		var output = [];
		_.each(dataList, function(item) {
			output.push(item.s);
		});
		return output;
	},

	constructFlipperData: function(flipperBodyIndex, switchIndex, directionMultiplier) {
		return {	flipperBodyIndex: flipperBodyIndex,
					switchIndex: switchIndex,
					directionMultiplier: directionMultiplier };
	},

	allLightsExceptDiamond: function(callback) {
		var self = this;
		_.each(this.lightState, function(light, lightIndex) {
			if(lightIndex < self.diamondLightIndexStart || lightIndex > self.diamondLightIndexEnd) {
				callback(light, lightIndex);
			}
		});
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
			{ keyCode: 32, switchIndex: this.SW_PLUNGER_BUTTON },	// 'Space'
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

}); // define
